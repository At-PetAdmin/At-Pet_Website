# At-Pet 文档站

使用 Astro 构建的中文静态文档站，桌面应用参考 [At-PetAdmin/At-Pet](https://github.com/At-PetAdmin/At-Pet)。正文使用普通 Markdown；唯一的直接依赖是 `astro`，没有引入 React、Tailwind、文档主题、图标包或搜索服务。

## 运行环境

- Node.js `>=22.23.4`（当前开发环境为 Node.js 24.22.0）。
- npm `>=9.6.5`。

```bash
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://127.0.0.1:4321`。开发服务仅监听本机。

## 构建与检查

```bash
npm run build
npm run verify
npm run preview
```

`dist/` 是可以部署到静态托管平台的完整产物，不需要 Node 服务端。`verify` 检查构建页面、内部链接、静态资源与章节锚点。代码示例中的 At-Pet API 需要在用户本地执行，网站不会连接读者的本地桌宠服务。

## 项目结构

```text
public/images/logo.png       用户提供的网站 Logo 原图
src/content/docs/*.md        文档正文与 frontmatter
src/content.config.ts        Markdown 集合及元数据校验
src/pages/index.astro        文档首页
src/pages/docs/[...id].astro 文档静态路由、侧栏、章节目录与前后篇
src/pages/search.astro       构建时生成的全文搜索数据与原生浏览器搜索
src/pages/404.astro          自定义 404
src/layouts/Base.astro       导航、主题和公共布局
src/styles/global.css       配色、排版和响应式样式
scripts/verify-build.mjs     无额外依赖的构建产物检查
```

## 添加文档

在 `src/content/docs/` 创建 `.md` 文件：

```markdown
---
title: 示例文档
description: 用一句话说明这篇文档解决什么问题。
section: 桌宠指南
order: 11
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 第一个章节

这里使用普通 Markdown 编写内容。
```

`section` 可选“开始使用”“桌宠指南”“Agent 与开发”。`order` 控制侧栏与前后篇顺序。文件名生成路由，例如 `example.md` 对应 `/docs/example/`。新文档自动加入导航、首页手册和搜索索引。

正文内链接到同级文档时使用 `../installation/` 这样的相对路径，可以兼容子路径部署。页面和组件中的内部 URL 通过 `src/lib/site.ts` 处理 `BASE_URL`。

## 主题与交互

默认跟随系统明暗偏好，手动切换保存在浏览器本地。搜索支持标题、描述和正文关键词，按空白分词并匹配所有关键词；快捷键为 Ctrl/Cmd + K。没有 JavaScript 时，文档、导航和搜索页上的完整文档列表仍可阅读。

网站使用系统字体、原生 SVG 图标与用户提供的 Logo，无外部字体、运行时 CDN 或统计脚本。提供移动端菜单、文档目录、键盘焦点、跳转正文和减少动画支持。

首页有一次性的代码显现、猫咪探头和气泡入场动画。鼠标悬停猫咪会轻轻歪头；点击、触屏或键盘 Enter / 空格可触发点头与轮换问候。按钮、卡片及移动导航提供短暂的交互过渡。系统开启“减少动态效果”时停用这些运动，问候文字仍然更新。动效通过 CSS 与原生 Web Animations API 实现，不增加依赖。

## 部署配置

### GitHub Pages

工作流位于 `.github/workflows/pages.yml`。推送到 `main` 后自动安装锁定的依赖，构建并检查静态站，然后部署到 GitHub Pages。也可在 Actions 中手动运行 **Deploy documentation to GitHub Pages**。

在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。部署使用 GitHub 自动提供的短期令牌，无需添加个人访问令牌或其他 Secret。

站点地址：[https://at-petadmin.github.io/At-Pet_Website/](https://at-petadmin.github.io/At-Pet_Website/)。工作流从 Pages 配置读取域名与子路径，同时传给构建与链接检查，确保资源、导航、搜索和 canonical URL 使用相同路径。只有检查通过的构建产物才会进入部署步骤。

### 其他静态托管

默认部署到域名根目录。需要 canonical URL 或子路径时，在构建前设置环境变量。例如 PowerShell：

```powershell
$env:SITE_URL = 'https://example.com'
$env:BASE_PATH = '/At-Pet_Website'
npm run build
npm run verify
```

将 `dist/` 的内容放到对应 `/At-Pet_Website/` 路径下。根目录部署时，移除 `BASE_PATH` 或设为 `/`。托管平台应将不存在的路径返回 `404.html`，并保留 404 状态。

## 内容来源与许可

文档在 2026-11-07 根据 At-Pet `main` 的提交 `f5a799f31378619405642aed92644f6baffc9880` 整理，主要依据 `README_CN.md`；每篇文档包含上游来源链接。上游后续更新需要人工同步，不会在网站构建时请求 GitHub，也没有把调研草稿中的计划当作已实现功能。

上游文档使用 MIT 许可，其版权与许可原文保存在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。用户提供的 Logo 原图保留在 `public/images/logo.png`，不将其额外授权为 MIT。
