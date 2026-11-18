---
title: 本地 API 鉴权
description: 从 1.3.4 起本地 API 需要 Bearer 凭证；这里说明凭证来源、调用方式与升级后的修复步骤。
section: Agent 与开发
order: 10
source: https://github.com/At-PetAdmin/At-Pet/blob/v1.3.4/docs/local-api-security.md
---

## 1.3.4 起的变化

At-Pet 1.3.4 为本地 HTTP API 加上鉴权：除 `GET /health` 外，所有端点都要求 `Authorization: Bearer <token>`。没有免鉴权的兼容模式，原有的回环 `Host` 检查、拒绝 `Origin` 请求头、不返回 CORS 响应头继续生效。

- 缺少凭证，或 token 不属于本机凭据库时返回 `401`。
- 凭证有效但无权执行该操作时返回 `403`，例如用 Agent 凭证读取 `/state`。
- 请求被拒绝时不会执行操作，也不会建立 Agent 连接。

> 1.3.4 之前安装的 hook、插件和桥接脚本不会自动带上 token。升级应用后它们仍指向正确地址，但请求会被 `401` 拒绝，接入状态也不再有新事件。处理方式见本文的“升级到 1.3.4 之后”一节。

## 凭证存放在哪里

At-Pet 首次启动时生成凭证并写入 `%LOCALAPPDATA%\Ni-ShuWu\At-Pet\api-security\clients.json`：

| 条目 | 用途 |
| --- | --- |
| `admin`（`administrator: true`） | 全局状态、SSE、桌宠控制，以及任意 Agent 的事件 |
| 每个已注册 Agent 一个条目 | 该 Agent 的事件、权限请求与提问 |
| `external` | 通用发送端 |

每个 token 是 256 位随机数，保存为 64 个十六进制字符。目录带受保护的 DACL，只有当前用户和 SYSTEM 可访问。文件损坏或不可读时 API 会停用，不会静默重建凭证或关闭鉴权。

> 这是凭据，不是安装密钥。不要复制到仓库、脚本、工单或截图里，也不要通过聊天工具发送。需要分享接入方式时，分享上面的步骤，而不是 token。

## 取得 Agent 的 token

升级到 1.3.4 并启动 At-Pet 后，在准备启动 Agent 的 PowerShell 中执行。下面的片段把 token 放进当前会话的环境变量，不打印内容：

```powershell
$storePath = Join-Path $env:LOCALAPPDATA 'Ni-ShuWu/At-Pet/api-security/clients.json'
$store = Get-Content -LiteralPath $storePath -Raw | ConvertFrom-Json
$env:AT_PET_API_TOKEN_CLAUDECODE = ($store.clients | Where-Object id -eq 'claudecode').token
```

`claudecode` 是 Claude Code 在凭据库中的键。其他键由 Agent 名称转小写、去掉非字母数字字符得到，例如 `github-copilot` 是 `githubcopilot`，`deepseek-harness` 是 `deepseekharness`。键不存在时集成读不到凭证，桥接会退回 Agent 自身的行为。

需要在 PowerShell 里直接发送请求时，从同一个变量取请求头：

```powershell
$headers = @{ Authorization = "Bearer $env:AT_PET_API_TOKEN_CLAUDECODE" }
```

## 端点授权

| 端点 | 需要的凭证 |
| --- | --- |
| `GET /health` | 公开；响应包含 `authenticationRequired: true` |
| `POST /event`、`POST /agent-event/<agent>` | 与该 Agent 绑定的客户端，或管理员 |
| `POST /permission`、`POST /question` | 与请求中 `agentApp` 绑定的客户端，或管理员 |
| `GET` / `DELETE` `/permission/<requestId>`、`/question/<requestId>` | 创建该请求的客户端，或管理员；其他凭证得到 `404` |
| `GET /state`、`GET /events` | 管理员 |
| `POST /say`、`POST /animation`、`POST /summon` | 管理员 |

服务端会写入 `clientId`，调用方不能在 JSON 里伪造。非管理员凭证既读不到其他客户端的状态和 SSE，也轮询不到别人的权限与提问。

## 调用示例

下面的示例沿用前面取得的 `$headers`。端口不是默认值时，替换地址中的端口。

### 健康检查

`GET /health` 是唯一不需要凭证的端点，适合确认服务在监听：

```powershell
Invoke-RestMethod http://127.0.0.1:8765/health
```

响应包含 `ok` 与 `authenticationRequired`。它只说明服务在监听，不说明任何发送端已经带上凭证接入。

### 上报事件

```powershell
Invoke-RestMethod http://127.0.0.1:8765/event -Method Post `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"sessionId":"docs-test","agentApp":"claude-code","event":"thinking"}'
```

使用 Agent 凭证时，`agentApp` 归一化后必须等于凭证绑定的 Agent，否则返回 `403`；省略 `agentApp` 时服务端直接使用凭证对应的 Agent。管理员凭证不受此限制。测试完成后发送 `session_end` 结束会话。

### 权限请求

```powershell
$request = Invoke-RestMethod http://127.0.0.1:8765/permission -Method Post `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{"sessionId":"docs-test","agentApp":"claude-code","toolName":"Bash","description":"Run tests"}'

Invoke-RestMethod "http://127.0.0.1:8765/permission/$($request.requestId)" -Headers $headers
```

轮询返回 `pending`、`allowed_once` 或 `denied`。作出决定后的首次轮询会消费结果，之后的请求，以及使用其他凭证的请求，都返回 `404`。`DELETE` 同一路径可以取消通用请求；Claude 原生 HTTP hook 的请求不能通过它取消。

### 桌宠控制

`/say`、`/animation`、`/summon`、`/state` 和 `/events` 只接受管理员凭证。手动控制时从同一凭据库读取 `admin` 条目：

```powershell
$adminToken = ($store.clients | Where-Object { $_.administrator }).token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod http://127.0.0.1:8765/say -Method Post `
  -Headers $adminHeaders `
  -ContentType 'application/json' `
  -Body '{"text":"Hello from At-Pet!"}'
```

管理员凭证覆盖所有本地端点。只在当前 PowerShell 会话里使用，不要交给 Agent 集成或第三方脚本，也不要写进配置文件。

## 自定义发送端与第三方集成

随附的 Node 集成和 Copilot 的 PowerShell 发送端会自动读取对应 Agent 的凭证，通常不需要额外设置。它们只接受回环地址、拒绝重定向，也不会自动选用管理员凭证。

需要覆盖默认行为时，可以使用三个环境变量：

| 变量 | 作用 |
| --- | --- |
| `AT_PET_CREDENTIALS` | 指定凭据库路径 |
| `AT_PET_API_TOKEN_<AGENTKEY>` | 为某个 Agent 指定 token；`<AGENTKEY>` 大写并去掉标点，例如 `AT_PET_API_TOKEN_GITHUBCOPILOT` |
| `AT_PET_API_TOKEN` | 为整个进程指定同一个 token |

优先级从高到低：Agent 专用变量、`AT_PET_API_TOKEN`、凭据库。除非确实需要，否则保留默认行为，让发送端读取凭据库。

### 往凭据库添加客户端

退出 At-Pet 后编辑 `clients.json`，向 `clients` 数组追加条目，保留已有的 `version` 和其他条目：

```json
{
  "id": "my-sender",
  "agentKey": "external",
  "token": "<32–256 个字符的随机值>",
  "administrator": false
}
```

- `id`：唯一名称，1–128 个字母、数字、`.`、`_` 或 `-`。
- `agentKey`：归一化后的 Agent 键，例如 `claudecode`、`opencode`，通用发送端可用 `external`，自定义发送端用自己的键（例如 `myagent`）。必须写归一化后的值，写错会让整个凭据库校验失败，API 直接停用。
- `token`：至少 32 个字符的高强度随机值，由字母、数字、`-` 和 `_` 组成。
- `administrator`：自定义发送端保持 `false`。

可以用 PowerShell 生成 token，把输出的值粘贴进条目：

```powershell
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$random.GetBytes($bytes)
-join ($bytes | ForEach-Object { $_.ToString('x2') })
```

保存后重启 At-Pet 使条目生效。多个客户端可以绑定同一个 Agent，但各自的请求归属和会话状态分别记录。

### 使用自己的 agentApp

如果发送端上报自己的标签，例如 `my-agent`，`agentKey` 要写成它归一化后的值 `myagent`，并且事件、权限与提问里的 `agentApp` 都要归一化到同一个键。

绑定 `external` 时，`POST /event` 可以省略 `agentApp`，服务端会填入 `external`；`POST /permission` 和 `POST /question` 仍要在请求体里显式写 `"agentApp": "external"`。

### 轮换与撤销

在 At-Pet 停止时替换或删除对应条目，然后重启应用。引用旧 token 的环境变量要一起更新。删除整个凭据库会在下次启动时生成全套新 token，并吊销所有旧客户端。

## 升级到 1.3.4 之后

1.3.4 之前安装的集成不会自动获得凭证。发送端地址没变，但请求会被 `401` 拒绝。按顺序处理：

1. 升级 At-Pet 并启动一次，让当前版本生成或沿用凭据库。
2. 重新执行设置 → Agent 事件接入中的 **一键配置已选 Agent**，或把随附的集成文件整体替换为新版本。一键配置会把当前版本的桥接程序和认证助手释放到 At-Pet 的本地应用数据目录，hook 引用这些副本，所以重新配置就能拿到新发送端。
3. Node 集成要保证 `client-auth.mjs` 与入口脚本在同一目录、同为当前版本。`bridge.mjs`、`at-pet.ts`、`server.mjs` 都通过同目录的这个文件读取凭证；只复制其中一个，或留下旧版 `client-auth.mjs`，都会读不到 token。
4. Claude Code 原生 HTTP hook 要在启动 Claude Code 的 PowerShell 中设置 `AT_PET_API_TOKEN_CLAUDECODE`（见前面“取得 Agent 的 token”），并在每个 hook 条目里把这个变量列入 `allowedEnvVars`，见下面的配置。
5. 重启 Agent 和启动它的终端。已经运行的进程读不到新设置的环境变量，也不会重新加载 hook 配置。
6. 确认端口没有变化。改过 `AT_PET_PORT`，或 hook 里保存的端口与当前端口不一致时，要重新配置 hook，并重启 At-Pet 与 Agent。

Claude Code 的 hook 条目需要 `headers` 与 `allowedEnvVars` 两个字段，否则凭证不会随请求发出：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "http://127.0.0.1:8765/agent-event/claudecode",
            "timeout": 600,
            "headers": { "Authorization": "Bearer $AT_PET_API_TOKEN_CLAUDECODE" },
            "allowedEnvVars": ["AT_PET_API_TOKEN_CLAUDECODE"]
          }
        ]
      }
    ]
  }
}
```

其他 hook 事件要重复同样的 `headers` 与 `allowedEnvVars`；随附配置已经包含全部事件，优先使用一键配置而不是手写。

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| 所有请求都返回 `401` | 没有 `Authorization` 头，或 token 不属于当前凭据库（换过 Windows 用户、删过凭据库） | 从当前凭据库重新读取；删除过凭据库时，旧 token 已全部失效 |
| 升级后只有某些发送端 `401` | 该集成的副本仍是 1.3.4 之前的版本 | 重新执行一键配置或替换集成文件，然后重启 Agent |
| 事件 `403`，错误信息为 `credential does not own this agent` | `agentApp` 与凭证绑定的 Agent 不一致 | 换成对应 Agent 的凭证，或省略 `agentApp` 让服务端填充 |
| 桌宠控制 `403`，错误信息为 `administrator credential required` | 用 Agent 凭证调用了 `/say`、`/animation` 等端点 | 这些端点只接受管理员凭证 |
| 轮询权限或提问得到 `404` | 用了非创建者的凭证，或结果已被消费 | 用创建请求的同一个客户端轮询，并在决定后只读取一次 |
| hook 不报错但桌宠没有反应 | 缺少凭证时桥接会退回 Agent 自身行为，退出码仍为 `0` | 检查发送端版本与接入状态，确认凭证可以读取 |

## 安全边界

- 服务只绑定回环地址，请求的 `Host` 必须是 `127.0.0.1`、`localhost` 或 `[::1]`。不要用端口转发、反向代理或隧道把端口暴露到网络，也不要让其他机器访问。
- token 用于区分集成、阻止未鉴权调用者和其他 Windows 用户使用 API。它不隔离同一个操作系统用户下互相敌对的程序：以当前用户身份运行的程序可以读取该用户的凭据文件。
- 权限决定仍然需要本机弹窗。token 不提供远程批准通道，也不改变“仅本次允许 / 拒绝”的选项。
- 浏览器来源继续受 `Host`、`Origin` 与 CORS 限制，网页不能借用 token 调用本地 API。
- 不要提交 `clients.json`、token 或其截图。凭据只应留在这台机器上，环境变量只应存在于当前进程。
