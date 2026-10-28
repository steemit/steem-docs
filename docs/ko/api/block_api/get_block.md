---
title: "block_api.get_block"
description: "참조된 블록의 전체 서명된 블록을 가져오며, 일치하는 블록이 없으면 null을 반환합니다."
outline: [2, 3]
---

# block_api.get_block

## Purpose

참조된 블록의 전체 서명된 블록을 가져오며, 일치하는 블록이 없으면 null을 반환합니다.

**파라미터:**

  * `block_num:int`

| `block_num` (int) | |
|-------------------|-|
| `1` | 가장 첫 번째 블록을 조회합니다. |
| `8675309` | 블록 번호 8,675,309를 조회합니다. |
| `62396745` | 블록 번호 62,396,745를 조회합니다. |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "block_num": 0
}
```

</div>

## Example

### Example 1

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "block_api.get_block",
    "params": {
      "block_num": 1
    },
    "id": 1
  }'
```

</div>

### Example 2

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "block_api.get_block",
    "params": {
      "block_num": 8675309
    },
    "id": 1
  }'
```

</div>

### Example 3

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "block_api.get_block",
    "params": {
      "block_num": 62396745
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{}
```

</div>
