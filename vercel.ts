import { routes, type VercelConfig } from '@vercel/config/v1';

/**
 * 演示门户入口 `demo.autional.cn` 的唯一源站。
 *
 * 值 **不写入本仓**，取自 Vercel 项目环境变量 `DEMO_ORIGIN`
 * （Project -> Settings -> Environment Variables）。
 * 未设置时 **故意抛错**（fail-closed），避免静默产出坏路由。
 *
 * 过渡期：`DEMO_ORIGIN=https://cn.autional.tianv.mobi`（与 cn-api 同一 tianv.mobi 桥，
 * dev 单实例；该 host 已验证可服务门户全部路径，且走 ingress `cn.` 分支保留真实客户端 IP）。
 */
const rawOrigin = process.env.DEMO_ORIGIN;

if (!rawOrigin) {
  throw new Error(
    '[cn-demo] 缺少环境变量 DEMO_ORIGIN（Vercel 项目设置里配置后重新部署）',
  );
}

const ORIGIN = rawOrigin.replace(/\/+$/, '');

/**
 * 只代理门户所需路径（**最小暴露面**，不做全量透传）：
 *   /            -> 门户页（26 服务卡）
 *   /demos.html  -> 门户页直链
 *   /demo/*      -> 门户静态资源与演示 API（assets / api/config / api/demo-tokens）
 *   /health      -> 门户状态带探活（SYSTEM ACTIVE / API ERROR）
 *   /ready       -> 门户同源存活探针
 *
 * 说明：逐服务演示台在各 `<svc>-demo.<域>` 主机（卡片链接由源站下发），不经本入口；
 * 对外 API 面走 api.autional.cn（cn-api 仓），本仓不重复暴露。
 */
export const config: VercelConfig = {
  rewrites: [
    routes.rewrite('/', `${ORIGIN}/demos.html`),
    routes.rewrite('/demos.html', `${ORIGIN}/demos.html`),
    // 裸 /demo 须在通配前精确透传：否则 /demo/:path* 空捕获被展开成 ${ORIGIN}/demo/，
    // 上游对 /demo/ 回 301 Location:/demo（相对跳转），浏览器回到原点成死循环。
    routes.rewrite('/demo', `${ORIGIN}/demo`),
    routes.rewrite('/demo/:path*', `${ORIGIN}/demo/:path*`),
    routes.rewrite('/health', `${ORIGIN}/health`),
    routes.rewrite('/ready', `${ORIGIN}/ready`),
  ],
};
