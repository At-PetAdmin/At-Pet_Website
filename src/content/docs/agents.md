---
title: Agent 接入
description: 选择事件发送方式，让桌宠跟上思考、工具调用和任务完成的节奏。
section: Agent 与开发
order: 8
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 先理解事件从哪里来

At-Pet 接收由 Agent 侧主动上报的事件，再将它们映射为桌宠动画。它不会扫描 Agent 进程，也不读取与机器相关的日志路径。

| 接入方式 | 适合场景 |
| --- | --- |
| Claude Code HTTP hooks | 将原生 hook payload 发送到内置适配器 |
| OpenCode V2 插件 | 使用仓库提供的 TypeScript 插件 |
| 桥接脚本 | 使用与目标 Agent 匹配的随附 hook / profile |
| MCP stdio 桥接 | 兼容 MCP 的客户端明确调用工具上报 |
| 通用 HTTP API | 自己的本地脚本或其他可信事件源 |

> MCP 桥接不自动监听生命周期。某个来源出现在设置列表中，也不表示已经有可用的事件发送端。请按对应集成的实际说明安装和验证。

## 先验证本地连接

启动 At-Pet，在 PowerShell 中执行：

```powershell
Invoke-RestMethod http://127.0.0.1:8765/health

Invoke-RestMethod http://127.0.0.1:8765/event -Method Post `
  -ContentType 'application/json' `
  -Body '{"sessionId":"docs-test","agentApp":"my-agent","event":"thinking"}'
```

检查桌宠是否切换状态，以及设置中的最近事件时间是否更新。测试完成后发送结束事件：

```powershell
Invoke-RestMethod http://127.0.0.1:8765/event -Method Post `
  -ContentType 'application/json' `
  -Body '{"sessionId":"docs-test","agentApp":"my-agent","event":"session_end"}'
```

如果配置了 `AT_PET_PORT`，相应替换示例中的端口。

## Claude Code

使用支持 HTTP hooks 的 Claude Code 版本，在设置中将需要的 hook 指向：

```text
http://127.0.0.1:8765/agent-event/claudecode
```

以下是最小的单 hook 配置示例。请合并到现有设置，不要覆盖已有 hooks；它只覆盖 `SessionStart`，完整生命周期与权限接入需要上游示例中的其他 hook。

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "http://127.0.0.1:8765/agent-event/claudecode",
            "timeout": 600
          }
        ]
      }
    ]
  }
}
```

上游示例还配置了 `UserPromptSubmit`、`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`Stop`、`SessionEnd`、`SubagentStart` 和 `SubagentStop`。查看 [完整原生集成配置](https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md#原生集成)，配置后重启 Claude Code。

## OpenCode V2

将上游的 [at-pet.ts](https://github.com/At-PetAdmin/At-Pet/blob/main/integrations/opencode-v2/at-pet.ts) 复制到项目的 `.opencode/plugins/`，或全局目录 `%USERPROFILE%\.config\opencode\plugins\`，然后重启 OpenCode。

仅当 At-Pet 使用非默认地址时，才需要按插件说明设置 `AT_PET_URL`。插件会上报会话和工具事件，并处理 `ask` 权限决定；At-Pet 不可用时，保留 OpenCode 原有的 `ask` 决定。

## MCP 与其他 Agent

兼容 MCP 的客户端可以按 [MCP 桥接说明](https://github.com/At-PetAdmin/At-Pet/blob/main/integrations/at-pet-mcp/README_CN.md) 配置本地 stdio 桥接。工具只有被明确调用时才会上报。

其他 Agent 可查看 [随附集成目录](https://github.com/At-PetAdmin/At-Pet/tree/main/integrations/agent-plugins) 与 [Agent 对接插件仓库](https://github.com/Ni-ShuWu/At-Pet_Agent-plugin)。不同来源支持的事件和权限回传能力不同，请以所选发送端的说明为准。

## 连通状态与子会话

首次收到某个来源的事件或断开后重新接入时，桌宠会播报连接成功；连续事件不会重复播报。任务完成或 `idle` 不会让连接立刻断开；所有会话结束后显示“已断开”，30 分钟没有事件显示“近期无事件”。

通过 `isSubagent` 或 `parentSessionId` 标识子会话，在 Agent Monitoring 中启用对应设置后，每个子会话可以拥有独立桌宠。

动画过滤只影响用于控制动画的事件，不影响接入状态判断或权限请求。
