---
title: 认识 At-Pet
description: 一只住在 Windows 桌面上的小伙伴，也是一座连接 Agent 工作状态的本地桥梁。
section: 开始使用
order: 1
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 它能陪你做什么

At-Pet 是一个使用 C++17 和 Qt 6 构建的桌面宠物应用。它生活在透明、无边框、始终置顶的小窗口中，支持 Windows 10 / 11 的 amd64（x86-64）与 ARM64 设备。

你可以拖着它换个位置，戳一戳听它说话，也可以把它放在其他窗口的标题栏上。工作时，通过本地集成把 Agent 事件发送给 At-Pet，桌宠就能用动画表现思考、工具调用、完成与错误等状态。

## 先带一只回家

1. 前往 [下载与安装](../installation/)，选择适合电脑架构的压缩包。
2. 解压并运行 `at-pet.exe`，内置桌宠会直接出现，无需先导入素材。
3. 单击、拖动或右键桌宠，熟悉 [日常互动](../interaction/)。

暂时不接入 Agent，也可以把 At-Pet 当作普通桌宠使用。

## 换成你喜欢的模样

At-Pet 支持通过 `pet.json` 与精灵表导入自定义桌宠。你可以预览、切换，或让宠物库中的所有有效桌宠一起出现。

- [宠物库与导入](../pet-library/)：导入、预览、全员上班与热加载。
- [动画与 pet.json](../pet-config/)：配置帧尺寸、动画、方向和帧率。
- [语录包](../quotes/)：为每只桌宠准备自己的台词。

## 让工作状态看得见

At-Pet 提供本地 HTTP API 和 SSE。Claude Code 可通过 HTTP hooks 接入；OpenCode V2 使用随附插件；其他来源可使用桥接脚本、MCP 或通用 HTTP API。

> Agent 事件需要由发送端主动上报。At-Pet 不会扫描 Agent 进程，也不会直接读取会话内部状态。设置中出现某个 Agent 名称，并不表示它已经连接。

从 [Agent 接入](../agents/) 选择适合你的方式，再使用 [本地 API](../local-api/) 验证事件是否到达。

## 平台与项目

At-Pet 当前仅支持 Windows；Linux 和 macOS 不在桌面应用的支持范围内。它基于 [MIT 许可](https://github.com/At-PetAdmin/At-Pet/blob/main/LICENSE) 发布。

桌面应用内置的宠物是受 Octocat 启发的同人 Q 版形象，与 GitHub 无隶属关系。

功能细节以 [At-Pet 上游仓库](https://github.com/At-PetAdmin/At-Pet) 和你正在使用的版本为准。
