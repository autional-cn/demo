# demo

`demo.autional.cn` 的**演示门户入口**（Vercel 反向代理）。

本仓**不含任何业务代码**，只承载一个反向代理配置。

## 职责

```
浏览器 -> demo.autional.cn            （对外演示入口）
       -> Vercel rewrite
       -> ${DEMO_ORIGIN}/...           （内部源站，原样转发、无路径前缀）
       -> 门户页（26 服务卡）
```

- 对外唯一演示域名 = **`demo.autional.cn`**（Vercel，境外 -> 不触发 ICP）
- 内部源站 = 环境变量 `DEMO_ORIGIN`；过渡期 = `https://cn.autional.tianv.mobi`（dev 单实例，与 `cn-api` 同一 tianv.mobi 桥）
- 只代理门户所需路径（`/`、`/demos.html`、`/demo`、`/demo/*`、`/health`、`/ready`）；对外 API 面走 `api.autional.cn`，本仓不重复暴露
- 逐服务演示台在各 `<svc>-demo.<域>` 主机（卡片链接由源站 `/demo/api/config` 下发），不经本入口

## 内容

| 文件 | 说明 |
|---|---|
| `vercel.ts` | 6 条 rewrite：`/`、`/demos.html`、`/demo`、`/demo/*`、`/health`、`/ready` -> `${DEMO_ORIGIN}/...` |
| `package.json` | 仅依赖 `@vercel/config`（`vercel.ts` 的运行时/类型） |
| `public/robots.txt` | 演示环境不索引（`Disallow: /`） |
| `LICENSE` | AGPL-3.0（与 `autional-cn/*` 一致） |

## 配置

**源站地址不入仓**，由环境变量提供：

| 变量 | 作用域 | 示例值 |
|---|---|---|
| `DEMO_ORIGIN` | Production / Preview / Development | `https://<origin-host>`（**内部源站**，不带路径前缀） |

未设置时 `vercel.ts` **故意抛错**（fail-closed），构建会失败 —— 这是刻意的，避免静默产出指向错误源站的路由。

> ⚠️ 说明：`vercel.json` **不支持环境变量插值**，所以这里用的是 Vercel 官方的
> **`vercel.ts`（build-time 动态配置）**。二者**只能存在一个**。

## 约定

- 根路径 `/` 经 rewrite 呈现门户；`public/` 下**不要**放 `index.html`
  （Vercel 先查文件系统再走 rewrite，静态 index 会顶掉门户）。
- 源站变更只改环境变量、不改本仓；本仓变更 = 改代理路径面。
- 改动本仓 = 改 `demo.autional.cn` 的代理行为；改完 push 即自动部署。

## 关联

- 设计依据：`AUTIONAL-CN-DEPLOY-PLAN.md`（单一后端入口 + 环境级源站域名选路）
- 执行/运维记录：`AUTIONAL-CN-DEPLOY-EXECUTION-LOG.md`
- 同模式参照：`autional-cn/api`（cn-api 仓）
