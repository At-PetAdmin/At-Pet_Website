---
title: 常见问题
description: 从找不到桌宠到 Agent 没有反应，按现象找到下一步检查方法。
section: 开始使用
order: 3
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 可以在 macOS 或 Linux 上用吗

At-Pet 桌面应用目前只支持 Windows 10 / 11，提供 amd64 与 ARM64 架构。这个文档网站可以在其他系统的浏览器中阅读。

## 为什么桌宠不见了

先查看 Windows 系统托盘，并展开隐藏图标区域。通过托盘菜单显示或重新召唤桌宠。

如果开启了免打扰，桌宠会缩小为贴在屏幕边缘的小气泡。可从托盘再次召唤，或取消“免打扰”。全屏应用自动免打扰可在常规设置中调整。

## 解压后无法启动

确认下载的架构与系统匹配，并且已经完整解压。不要直接在压缩包内运行，也不要只移动 `at-pet.exe` 而遗漏 Qt DLL 或插件目录。

从源码构建时，需要将对应 Qt 套件的 `bin` 加入 `PATH`，或使用 `windeployqt` 部署运行时。

## 为什么 Agent 没有反应

At-Pet 不会自动读取 Agent 的内部状态。检查发送端是否安装，事件地址是否指向当前 At-Pet 使用的端口，然后查看设置中的接入状态与最近事件时间。

在 PowerShell 中先检查本地服务：

```powershell
Invoke-RestMethod http://127.0.0.1:8765/health
```

健康检查不需要凭证，能返回 `ok` 说明服务在监听；发送事件和权限请求则需要 Bearer 凭证。如果健康检查成功但桌宠仍然没有反应，可以按 [Agent 接入](../agents/) 发送一条测试事件，并继续看下一条。MCP 桥接只有在工具被明确调用时才会上报，并不会自动订阅 Agent 生命周期。

## 升级到 1.3.4 后事件发送端返回 401 或连不上怎么办

1.3.4 起，本地 API 除 `GET /health` 外都要求 `Authorization: Bearer <token>`。升级前安装的 hook、插件和桥接脚本不带凭证，请求会被 `401` 拒绝，接入状态也不会更新。

按顺序处理：

1. 在设置 → Agent 事件接入中重新执行“一键配置已选 Agent”，或把随附的集成文件替换为新版本。
2. Node 集成要保证 `client-auth.mjs` 和入口脚本在同一目录、同为当前版本。
3. Claude Code 原生 HTTP hook：在启动 Claude Code 的 PowerShell 中设置 `AT_PET_API_TOKEN_CLAUDECODE`，并在 hook 配置的 `allowedEnvVars` 里声明这个变量。
4. 重启 Agent。运行中的进程不会读取新设置的环境变量。
5. 发一条测试事件，确认桌宠有反应、设置中的最近事件时间更新。

`GET /health` 不需要凭证，能返回 `ok` 只说明服务在监听，不能证明发送端已经带上凭证。凭证位置、覆盖方式与完整排查表见 [本地 API 鉴权](../local-api-auth/)。

## “近期无事件”表示什么

首次收到事件或重新连接时，桌宠会播报连接成功。任务完成和 `idle` 不会立刻断开连接；同一来源的所有会话结束后显示“已断开”，30 分钟未收到事件则显示“近期无事件”。

接入状态由收到的事件判断，与动画过滤开关独立。

## 为什么从网页调用本地 API 会返回 403

本地 API 要求回环 `Host`，且请求不得携带 `Origin`，也不提供浏览器跨域读取能力。请从可信本地脚本或原生集成调用，而不是在这个文档网站中发送请求。详见 [本地 API](../local-api/)。

缺少或无效的凭证返回 `401`，与这里的 `403` 不同；两者都不表示请求被静默忽略。

## 动画或语录不符合预期

先确认精灵表尺寸、`cell`、动画行和帧数是否匹配。动画的 `row` 从 0 开始，单个动画的 `fps` 会覆盖全局帧率。

语录会优先使用该桌宠的独立语录，缺少分类时回退到全局语录。戳一戳还会继续回退到 `pet.json` 的 `quotes` / `pokeQuotes`。查看 [动画配置](../pet-config/) 与 [语录包](../quotes/) 的详细规则。

## 还没有解决

在 [GitHub Issues](https://github.com/At-PetAdmin/At-Pet/issues) 搜索已有问题，或提供 Windows 版本、CPU 架构、At-Pet 版本、复现步骤和错误信息，帮助维护者定位。
