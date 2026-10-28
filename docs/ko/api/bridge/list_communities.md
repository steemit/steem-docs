---
title: "bridge.list_communities"
description: "모든 커뮤니티를 페이지네이션(pagination)으로 나열합니다. 라이트(lite) 버전의 커뮤니티 목록을 반환합니다."
outline: [2, 3]
---

# bridge.list_communities

## Purpose

모든 커뮤니티를 페이지네이션(pagination)으로 나열합니다. 라이트(lite) 버전의 커뮤니티 목록을 반환합니다.

`sort`에 지원되는 값:
  * `rank`
  * `new`
  * `subs`

파라미터: `last:string` (선택, 기본값은 빈 값); `limit:int` (선택, 기본값 `100`, 최대 `100`); `query:string` (선택, 제목과 소개에 대한 전문 검색); `sort:string` (선택, 기본값 `rank`); `observer:string` (선택)

추가 참조: bridge.get_community

## Parameters

<div class="code-card code-card-params">
<div class="code-card-title">PARAMETERS</div>

```json
{
  "last": "",
  "limit": 2,
  "query": null,
  "sort": "rank",
  "observer": null
}
```

</div>

## Example

<div class="code-card code-card-example">
<div class="code-card-title">BASH</div>

```bash
curl -s https://api.steemit.com \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "jsonrpc": "2.0",
    "method": "bridge.list_communities",
    "params": {
      "last": "",
      "limit": 2,
      "query": null,
      "sort": "rank",
      "observer": null
    },
    "id": 1
  }'
```

</div>

## Response

<div class="code-card code-card-response">
<div class="code-card-title">RESPONSE</div>

```json
[
  {
    "about": "শুধুমাত্র বাংলায় যাঁরা ব্লগিং করেন তাঁদের জন্য এই ব্লগ",
    "admins": [
      "blacks",
      "hafizullah",
      "shuvo35",
      "moh.arif",
      "rex-sumon",
      "rme",
      "winkles",
      "nusuranur",
      "swagata21"
    ],
    "avatar_url": "",
    "context": {},
    "created_at": "2021-06-11 09:36:21",
    "id": 1549301,
    "is_nsfw": false,
    "lang": "en",
    "name": "hive-129948",
    "num_authors": 69,
    "num_pending": 287,
    "subscribers": 9688,
    "sum_pending": 6886,
    "title": "আমার বাংলা ব্লগ",
    "type_id": 1
  },
  {
    "about": "United Steemit Community",
    "admins": [
      "blacks",
      "rme",
      "nusuranur"
    ],
    "avatar_url": "",
    "context": {},
    "created_at": "2022-10-02 16:30:15",
    "id": 1751564,
    "is_nsfw": false,
    "lang": "en",
    "name": "hive-150122",
    "num_authors": 29,
    "num_pending": 74,
    "subscribers": 4837,
    "sum_pending": 2052,
    "title": "Steem Alliance",
    "type_id": 1
  }
]
Note: response examples are captured at documentation-build time and may drift as chain state changes.
```

</div>
