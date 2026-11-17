---
title: 下载与安装
description: 选择适合设备的 Windows 压缩包，解压后就能和第一只桌宠见面。
section: 开始使用
order: 2
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 选择你的版本

前往 [GitHub Releases 下载 At-Pet](https://github.com/At-PetAdmin/At-Pet/releases/latest)，在对应版本的 Assets 中选择压缩包。

| 电脑类型 | 选择的架构 |
| --- | --- |
| 大多数 Intel / AMD Windows 电脑 | amd64（也叫 x86-64 或 x64） |
| 使用 ARM 处理器的 Windows 电脑 | ARM64 |

不确定架构时，打开 Windows **设置 → 系统 → 系统信息**，查看“系统类型”。桌面应用支持 Windows 10 / 11。

## 解压并启动

1. 下载与你的架构匹配的发布压缩包。
2. 将整个压缩包解压到一个独立文件夹。
3. 在该文件夹运行 `at-pet.exe`。

发布包包含 Qt 运行时，无需另行安装 Qt。请保留压缩包中的 DLL 和插件目录；仅复制一个 exe 可能导致启动失败。

启动后，内置桌宠会出现在桌面。右键桌宠可以打开菜单；Windows 系统托盘中也能找到控制入口。如果托盘图标没有直接显示，可以展开隐藏图标区域。

## 第一次设置

- **语言**：托盘菜单可切换简体中文和英语，默认跟随系统语言，并记住选择。
- **自由走动**：默认开启，可在右键菜单中调整。
- **完成提示音**：在常规设置中调整“Agent 任务完成时播放声音”。
- **免打扰**：需要专注时，可从托盘手动开启，或在常规设置中启用全屏自动免打扰。

完整操作见 [日常互动](../interaction/)。

## 升级到新版本

1. 退出正在运行的 At-Pet。
2. 下载对应架构的发布压缩包，解压替换程序目录。设置、宠物库和语录包保存在用户数据目录，不受影响。
3. 启动新版本。设置中的“获取更新”只负责检查和下载，不会自动替换正在运行的文件。

从 1.3.4 起，本地 API 除 `GET /health` 外都需要 Bearer 凭证。升级后要同步更新已安装的 hook、插件与桥接脚本，否则事件发送端会被 `401` 拒绝：

- Node 集成要保持 `client-auth.mjs` 与入口脚本在同一目录、同为当前版本。
- Claude Code 原生 HTTP hook 需要在启动它的 PowerShell 中设置 `AT_PET_API_TOKEN_CLAUDECODE`，并在 hook 配置里声明 `allowedEnvVars`。

完整步骤见 [本地 API 鉴权](../local-api-auth/)。

## 校验下载文件

正式发布通常同时提供 `.sha256` 文件。使用 PowerShell 计算压缩包的 SHA-256，并与同一版本的校验文件比较：

```powershell
Get-FileHash .\At-Pet-windows-amd64.zip -Algorithm SHA256
```

压缩包名称以实际下载的文件为准。如果安装了 GitHub CLI，也可以验证构建来源证明：

```bash
gh attestation verify At-Pet-windows-amd64.zip --repo At-PetAdmin/At-Pet
```

构建来源证明用于确认文件由哪个仓库和工作流产生。Windows 发布者提示则与 Authenticode 签名及证书信任有关，两者用途不同。

## 获取测试构建

开发者可在 [GitHub Actions](https://github.com/At-PetAdmin/At-Pet/actions) 的工作流运行记录中下载 Artifacts。amd64 工作流在 Pull Request 和推送到 `main` 时构建；ARM64 工作流支持手动运行，也会在版本标签触发时发布。

如果遇到启动问题，继续查看 [常见问题](../faq/)。如果准备从源码构建，查看 [构建与贡献](../development/)。
