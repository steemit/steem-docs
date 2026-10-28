#!/usr/bin/env python3
"""T20 source-inventory extractor for hivemind_legacy (phase 3 plan §1/§4-T20).

Parses hive/server/serve.py's methods.add(**{...}) registration points —
3 dict-comprehension calls + 4 literal dicts — and resolves every registered
method to its function signature, producing data/source-inventory/hivemind.json.

Extraction rules (see also data/README.md "Source inventory"):

- Registration truth = serve.py's 7 methods.add(**{...}) calls. `def`s in
  hive_api/community.py etc. that are never registered do NOT enter the
  inventory.
- Dict comprehension key `'prefix.' + method.__name__` gives the namespace
  prefix; aliases imported `as x` and functools.wraps both keep the function's
  own name, so `__name__` is statically resolvable from the reference name.
- Literal dict keys are full 'ns.method' strings (authoritative).
- Parameter names/defaults come from the resolved function's AST signature:
  the leading `context` parameter and */** catch-alls are excluded; defaults
  are JSON-serialized constants (ast.unparse fallback for expressions).
- Type annotations are absent by design (hivemind validates inside function
  bodies), so `type` is null for every method.
- `dummy: true` marks stub registrations: function body (docstring excluded)
  is a single `raise` (the two get_account_votes dummies serve an ApiError).
- `call` is the legacy adapter namespace; its params are (api, method, params)
  per the call(context, api, method, params) signature.

Deterministic: same repo state → byte-identical output (registration order,
sorted namespace keys on output, stable JSON).

Usage: extract-hivemind.py [--repo <path>] [--out <path>]
       (defaults: ~/workspace/hivemind_legacy, data/source-inventory/hivemind.json)
"""

import argparse
import ast
import json
import subprocess
import sys
from pathlib import Path

DEFAULT_REPO = Path.home() / "workspace" / "hivemind_legacy"
DEFAULT_OUT = Path(__file__).resolve().parent.parent.parent / "data" / "source-inventory" / "hivemind.json"


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", default=str(DEFAULT_REPO))
    p.add_argument("--out", default=str(DEFAULT_OUT))
    return p.parse_args()


def default_value(node, source):
    if node is None:
        return None
    if isinstance(node, ast.Constant):
        return node.value
    try:
        return ast.unparse(node)
    except Exception:  # pragma: no cover - very old python fallback
        return ast.get_source_segment(source, node) or "?"


def module_path(repo, dotted):
    """Module dotted name → file path if it exists (module alias check)."""
    cand = repo.joinpath(*dotted.split("."))
    for p in (cand.with_name(cand.name + ".py"), cand / "__init__.py"):
        if p.is_file():
            return p
    return None


def module_and_func(repo, imports, ref):
    """Resolve a registration reference (ast Name/Attribute) to (file, funcname).

    imports: alias -> (module_dotted, imported_name, is_module_alias)
    """
    if isinstance(ref, ast.Attribute):
        alias = ref.value.id
        mod, _, is_mod = imports[alias]
        if not is_mod:
            raise SystemExit(f"{alias} is not a module alias; attribute ref {ast.dump(ref)}")
        return module_path(repo, mod), ref.attr
    if isinstance(ref, ast.Name):
        mod, name, is_mod = imports[ref.id]
        if is_mod:
            raise SystemExit(f"{ref.id} is a module alias; bare ref unexpected")
        return module_path(repo, mod), name
    raise SystemExit(f"Unsupported reference: {ast.dump(ref)}")


def func_signature(repo, path, func_name, cache):
    """Return (params, is_dummy) for func_name in file path."""
    key = (str(path), func_name)
    if key in cache:
        return cache[key]
    src = path.read_text(encoding="utf-8")
    tree = ast.parse(src)
    fn = None
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == func_name:
            fn = node
            break
    if fn is None:
        raise SystemExit(f"function {func_name} not found in {path}")

    params = []
    a = fn.args
    pos = a.args
    defaults = [None] * (len(pos) - len(a.defaults)) + list(a.defaults)
    for arg, d in zip(pos, defaults):
        if arg.arg == "context" and not params:
            continue  # jsonrpcserver context injection, not an API param
        item = {"name": arg.arg}
        if d is not None:
            item["default"] = default_value(d, src)
        params.append(item)
    # *args / **kwargs catch-alls are not JSON-RPC params; skip.

    body = list(fn.body)
    if body and isinstance(body[0], ast.Expr) and isinstance(body[0].value, ast.Constant) \
            and isinstance(body[0].value.value, str):
        body = body[1:]  # docstring
    is_dummy = len(body) == 1 and isinstance(body[0], ast.Raise)

    cache[key] = (params, is_dummy)
    return cache[key]


def collect_registrations(repo, serve_path):
    src = serve_path.read_text(encoding="utf-8")
    tree = ast.parse(src, filename=str(serve_path))

    # Imports in serve.py: alias -> (module_dotted, imported_name, is_module_alias)
    imports = {}
    for node in tree.body:
        if isinstance(node, ast.ImportFrom):
            for alias in node.names:
                is_mod = module_path(repo, f"{node.module}.{alias.name}") is not None
                dotted = f"{node.module}.{alias.name}" if is_mod else node.module
                imports[alias.asname or alias.name] = (dotted, alias.name, is_mod)

    registrations = []  # (namespace, method_name, ref)
    for node in ast.walk(tree):
        if not (isinstance(node, ast.Call)
                and isinstance(node.func, ast.Attribute) and node.func.attr == "add"
                and isinstance(node.func.value, ast.Name) and node.func.value.id == "methods"):
            continue
        kw = [k for k in node.keywords if k.arg is None]  # the ** unpack
        if len(kw) != 1:
            raise SystemExit(f"methods.add without ** at line {node.lineno}")
        payload = kw[0].value

        if isinstance(payload, ast.DictComp):
            # key: 'prefix.' + method.__name__
            key = payload.key
            if not (isinstance(key, ast.BinOp) and isinstance(key.op, ast.Add)
                    and isinstance(key.left, ast.Constant) and isinstance(key.left.value, str)
                    and isinstance(key.right, ast.Attribute) and key.right.attr == "__name__"):
                raise SystemExit(f"Unsupported dict-comp key at line {node.lineno}")
            prefix = key.left.value
            gen = payload.generators[0]
            refs = list(gen.iter.elts) if isinstance(gen.iter, (ast.Tuple, ast.List)) else [gen.iter]
            for ref in refs:
                name = ref.attr if isinstance(ref, ast.Attribute) else \
                    (imports[ref.id][1] if ref.id in imports else ref.id)
                registrations.append((prefix.rstrip("."), name, ref))
        elif isinstance(payload, ast.Dict):
            for k, v in zip(payload.keys, payload.values):
                if not isinstance(k, ast.Constant) or not isinstance(k.value, str):
                    raise SystemExit(f"Non-literal dict key at line {node.lineno}")
                ns, dot, rest = k.value.partition(".")
                registrations.append((ns, rest if dot else ns, v))
        else:
            raise SystemExit(f"Unsupported methods.add payload at line {node.lineno}")

    return registrations, imports


def main():
    opts = parse_args()
    repo = Path(opts.repo).resolve()
    serve = repo / "hive" / "server" / "serve.py"
    if not serve.is_file():
        print(f"serve.py not found at {serve}", file=sys.stderr)
        return 1

    commit = subprocess.run(["git", "-C", str(repo), "rev-parse", "--short=7", "HEAD"],
                            capture_output=True, text=True, check=True).stdout.strip()
    branch = subprocess.run(["git", "-C", str(repo), "rev-parse", "--abbrev-ref", "HEAD"],
                            capture_output=True, text=True, check=True).stdout.strip()

    registrations, imports = collect_registrations(repo, serve)

    sig_cache = {}
    namespaces = {}
    for ns, name, ref in registrations:
        # Local function defined in serve.py itself?
        if isinstance(ref, ast.Name) and ref.id not in imports:
            path, func = serve, ref.id
        else:
            path, func = module_and_func(repo, imports, ref)
        params, is_dummy = func_signature(repo, path, func, sig_cache)
        method = {"name": name, "params": params, "type": None}
        if is_dummy:
            method["dummy"] = True
        namespaces.setdefault(ns, {"methods": []})["methods"].append(method)

    out = {
        "repo": "hivemind_legacy",
        "commit": commit,
        "branch": branch,
        "bindings": sum(len(v["methods"]) for v in namespaces.values()),
        "namespaces": {k: namespaces[k] for k in sorted(namespaces)},
    }
    out_path = Path(opts.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    summary = " ".join(f"{k}={len(v['methods'])}" for k, v in out["namespaces"].items())
    print(f"hivemind inventory: {out['bindings']} bindings ({summary}) -> {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
