---
title: 本地 API
description: 通过 HTTP 控制桌宠、上报事件，并用 SSE 获取状态更新。
section: Agent 与开发
order: 9
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 地址与访问限制

默认地址为 `http://127.0.0.1:8765`。可用环境变量 `AT_PET_PORT` 更改端口。

API 仅供同一台机器上的可信程序使用，不进行身份验证。不要把端口暴露或转发到网络。请求的 `Host` 必须是回环地址，且不能带 `Origin` 请求头；响应不包含 `Access-Control-Allow-Origin`。

带 `Content-Type` 的 POST 请求必须使用 `application/json`。浏览器网页的请求会受到限制，下面的示例应在本地 PowerShell 中执行。

## 状态与控制

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/health` | 健康检查 |
| GET | `/state` | 当前桌宠与已知 Agent 会话，含 `agentSources` |
| GET | `/events` | SSE，连接时与状态变化时推送 JSON 状态快照 |
| POST | `/say` | 显示文字气泡 |
| POST | `/animation` | 切换动画 |
| POST | `/summon` | 召唤指定桌宠或全部桌宠 |

```powershell
Invoke-RestMethod http://127.0.0.1:8765/say -Method Post `
  -ContentType 'application/json' `
  -Body '{"text":"Hello from At-Pet!"}'

Invoke-RestMethod http://127.0.0.1:8765/animation -Method Post `
  -ContentType 'application/json' `
  -Body '{"name":"sleep"}'

Invoke-RestMethod http://127.0.0.1:8765/summon -Method Post `
  -ContentType 'application/json' `
  -Body '{"all":true}'
```

指定召唤使用 `{"petId":"sample-cat"}`。`petId` 必须是宠物库中的纯目录名，包含 `/`、`\`、`:`、控制字符，或等于 `.` / `..` 时会返回 `400`。

## 上报 Agent 事件

向 `POST /event` 发送 JSON：

```json
{
  "sessionId": "session-1",
  "agentApp": "my-agent",
  "event": "tool_start",
  "model": "my-model",
  "message": "Running tests",
  "isSubagent": false
}
```

多个 `sessionId` 分别跟踪。最近更新的非子代理会话驱动主桌宠；子会话可用 `isSubagent` 或 `parentSessionId` 标识。

| 事件示例 | 动画 / 行为 |
| --- | --- |
| `thinking` / `model_thinking` | 思考 |
| `tool_start` / `tool_running` | 工具执行 |
| `tool_end` | 回到思考 |
| `work` | 工作 |
| `review` / `reflection` | 审阅 |
| `completed` / `done` | 完成 |
| `cancelled` / `aborted` | 取消 |
| `error` / `failed` | 错误 |
| `idle` / `session_end` | 移除会话 |

终止状态动画短暂显示后，下一活动会话或空闲状态会接管。

## 权限请求

`POST /permission` 会弹出权限请求，并在响应中返回 `requestId`：

```json
{
  "sessionId": "session-1",
  "agentApp": "my-agent",
  "toolName": "Bash",
  "description": "Run tests"
}
```

使用 `GET /permission/{requestId}` 轮询 `pending`、`allowed_once` 或 `denied`。作出决定后的首次轮询会消费该结果，后续请求返回 `404`。

`DELETE /permission/{requestId}` 可取消通用待处理请求并关闭弹窗；Claude 原生 HTTP hook 请求不能通过此端点取消。

弹窗只提供“仅本次允许”和“拒绝”，关闭弹窗也视为拒绝。请求不会自动超时或自动拒绝。At-Pet 不执行工具，通用集成需要自行把用户决定落实到对应工具请求。

## 向用户提问

通过 `POST /question` 打开问题弹窗：

```json
{
  "agentApp": "my-agent",
  "sessionId": "session-1",
  "question": "应该选择哪个选项？",
  "choices": ["A", "B"]
}
```

`agentApp` 和 `question` 必填，`header` 与 `choices` 可选。用户也可以输入自定义答案。

使用 `GET /question/{requestId}` 轮询 `pending`、`answered`（包含 `answer`）或 `cancelled`。决定后的首次轮询会消费结果。`DELETE /question/{requestId}` 可取消请求。

## 原生适配器端点

- `POST /agent-event/claudecode`：接收 Claude Code HTTP hook 原始 payload，权限 hook 会保持连接直到用户决定。
- `POST /agent-event/opencode`：接收随附 OpenCode V2 插件归一化的事件。

发送原生事件前，先完成 [Agent 接入](../agents/) 中对应的配置。
