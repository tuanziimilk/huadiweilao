# 后会友期 · 旧账大西瓜

阶段 1：Phaser 3 + Matter 物理原型。占位多边形并非最终美术。

运行：`npm install`、`npm run dev`；发布：`npm run build` 后将 dist 目录部署至静态托管。依赖打包在本地，不使用海外 CDN。

阶段顺序：物理原型及验证 → 九级透明 PNG 和图鉴 → 特殊效果 → 完整 UI 和分享 → 稳定性与部署。

调研：Coteh/suika-clone（MIT，Phaser 3 + TypeScript）可作为参考；sgbj/suika-clone 同栈，但没有确认许可，不复制其源码。当前原型独立实现，使用 Phaser 自带 Matter。

待验收：移动真机、十局长跑、连续链式升级和复杂堆叠；特殊效果、美术、声音、图鉴和分享尚未实现。未部署，不生成虚构入口或二维码。
