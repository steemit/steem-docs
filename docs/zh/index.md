---
layout: home

hero:
  name: "Steem 开发者文档"
  text: "面向 Steem 的现代 JSON-RPC 参考手册"
  tagline: "所有 API 方法与广播操作均在构建期从唯一的 YAML 事实源生成——可单独寻址、支持全文检索。中文站点目前提供导航与总览，方法页内容暂以英文呈现。"
  actions:
    - theme: brand
      text: API 参考
      link: /zh/api/
    - theme: alt
      text: GitHub
      link: https://github.com/steemit/steem-docs

features:
  - title: JSON-RPC 参考
    details: 每一个 condenser_api 与 appbase API 方法（含见证人、账户历史等接口）都有独立页面，可深度链接，摆脱了过去长达 29 万像素的巨型单页
  - title: 数据驱动
    details: API 定义以 YAML 维护，构建期校验并渲染——YAML 是唯一事实源，索引页列出全部方法并桥接到英文方法页
  - title: 内置搜索
    details: 全站全文检索覆盖所有 API 方法，无需外部服务；中文检索按单字切分索引，支持词中段匹配（如搜「见证」可命中「见证人」）
---
