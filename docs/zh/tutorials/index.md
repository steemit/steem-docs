---
title: 教程
description: 面向 Steem 官方客户端库（client library）的动手教程与用法示例——JavaScript/TypeScript 的 steem-js 与 Go 的 steemgosdk。
---

# 教程

本节收录了两个官方 Steem 客户端库的动手用法示例。所有示例均迁移自各库自身的文档，并且可以在 `https://api.steemit.com` 这样的公共节点（public node）上直接运行。

## 库一览

| 库 | 语言 | 包 / 模块 | 仓库 |
|---------|----------|------------------|------------|
| steem-js | JavaScript / TypeScript | npm 包 `@steemit/steem-js` 1.2.4 | [steemit/steem-js](https://github.com/steemit/steem-js) |
| steemgosdk | Go | Go 模块 `github.com/steemit/steemgosdk` | [steemit/steemgosdk](https://github.com/steemit/steemgosdk) |

两个库都与生成的 [API 参考](/zh/api/)所记录的同一个 JSON-RPC API 逐方法对应。通过教程学习客户端侧的使用模式；通过 API 参考了解每个方法在线路上的细节。

## steem-js 页面

- [快速开始](/zh/tutorials/steem-js/) - 安装、浏览器用法、配置（`config.set`、`api.setUrl`、`setOptions`、多个 API 实例）、JSON-RPC 概览、API 路由、端到端用法示例、TypeScript 支持与错误处理。
- [读取链上数据](/zh/tutorials/steem-js/read-api.html) - 全部读取辅助方法：标签（tag）、博客与讨论、区块（block）、全局属性、账户、市场、投票、内容、见证人（witness），以及登录/关注辅助方法与离线认证、格式化、工具集。
- [广播操作](/zh/tutorials/steem-js/broadcast.html) - 完整的 `steem.broadcast` 操作目录、Promise/回调模式、多重签名与二进制交易（transaction）序列化。
- [签名调用与签名验证](/zh/tutorials/steem-js/signed-calls.html) - 经过认证的 `signedCall` 请求与签名验证工具集，并附完整的示例指南。
- [RPC auth 测试迁移](/zh/tutorials/steem-js/rpc-auth-migration.html) - `rpc-auth` 测试套件如何迁移进 steem-js。

## steemgosdk 页面

- [快速开始](/zh/tutorials/steemgosdk/) - 客户端初始化、读链 API 示例、密钥生成认证示例与 Steem URI 签名示例。
- [广播操作](/zh/tutorials/steemgosdk/broadcast.html) - 投票（vote）、转账（transfer）、评论、带受益人（beneficiary）的评论选项、多操作交易与 custom_json 广播，以及完整的端到端示例。
- [SignedCall API](/zh/tutorials/steemgosdk/signed-call.html) - 从 Go 发起经过认证的 JSON-RPC 调用，与 steem-js 的签名调用可互操作。

## 备注

- 教程目前仅提供英文，与指南（Guides）部分保持一致。
- 示例引用了各库自身文档中广为人知的测试密钥；切勿在生产环境中使用它们——请像认证示例中那样生成你自己的密钥。
