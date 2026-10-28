---
title: "database_api.find_votes"
description: "주어진 포스트에 대한 모든 투표를 반환합니다. 파라미터: author:string; permlink:string"
outline: [2, 3]
---

# database_api.find_votes

## Purpose

주어진 포스트에 대한 모든 투표를 반환합니다.  파라미터: `author:string`; `permlink:string`

| `author` (string) | `permlink` (string) | |
|----------------------------|---------------|-|
| `"steemit"` | `"firstpost"` | 슬러그 (slug)가 `@steemit/firstpost`인 콘텐츠의 투표를 조회합니다 |
| `"alice"` | `"a-post-by-alice"` | 슬러그 (slug)가 `@alice/a-post-by-alice`인 콘텐츠의 투표를 조회합니다 |

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "author": "",
  "permlink": ""
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
    "method": "database_api.find_votes",
    "params": {
      "author": "steemit",
      "permlink": "firstpost"
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
    "method": "database_api.find_votes",
    "params": {
      "author": "alice",
      "permlink": "a-post-by-alice"
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
{
  "votes": [
    {
      "id": 546191,
      "voter": "anonymous",
      "author": "temp",
      "permlink": "test1",
      "weight": "1799071158042053295",
      "rshares": "432321664017",
      "vote_percent": 10000,
      "last_update": "2016-07-18T09:25:51",
      "num_changes": -1
    },
    {
      "id": 546192,
      "voter": "xeroc",
      "author": "temp",
      "permlink": "test1",
      "weight": "1763636725870082814",
      "rshares": "525258058869",
      "vote_percent": 10000,
      "last_update": "2016-07-18T09:25:54",
      "num_changes": -1
    }
  ]
}
```

</div>

## Expected curl responses

<div class="code-card code-card-response">
<div class="code-card-title">EXPECTED RESPONSES</div>

```text
Could not find comment alice/a-post-by-alice
```

</div>
