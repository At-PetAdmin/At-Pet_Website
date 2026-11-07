---
title: 语录包
description: 为每只桌宠准备自己的台词，也可以让它们共享一份全局语录。
section: 桌宠指南
order: 7
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 全局与独立语录

每只桌宠都可以拥有独立语录包。没有独立语录，或独立语录缺少某个分类时，会回退到全局语录包。两者使用相同的 JSON 格式。

- **全局导入**：设置 → 常规设置 → 语录包 → 导入 quotes.json…
- **独立导入**：设置 → 桌宠库与预览 → 选中桌宠 → 导入独立语录…
- **恢复共享**：在选中桌宠后点击“使用全局语录”，移除它的独立配置。

导入与恢复会立即应用到该桌宠的所有运行实例，不会影响其他桌宠的独立配置。内置默认桌宠也可以设置独立语录。

## JSON 示例

```json
{
  "zh_CN": {
    "poke": ["别戳我啦～", "痒痒的！"],
    "done": ["完工啦，检查一下？"],
    "error": ["出错了，我们看看日志。"],
    "cancel": ["已取消，随时再叫我。"],
    "idle": ["要不要休息一下？", "我在这儿陪你。"]
  },
  "en": {
    "poke": ["Hey, that tickles!"],
    "done": ["All done! Want to review?"],
    "error": ["Something broke. Check the logs?"],
    "cancel": ["Cancelled. Ping me anytime."],
    "idle": ["Take a short break?"]
  }
}
```

## 五个分类

| 分类 | 触发时机 |
| --- | --- |
| `poke` | 单击、戳一戳桌宠 |
| `done` | Agent 完成任务 |
| `error` | Agent 报错 |
| `cancel` | Agent 任务取消 |
| `idle` | 没有活跃会话时的随机待机语录 |

分类支持别名，例如 `completed` / `completion` / `finished` 对应 `done`，`cancelled` / `canceled` / `aborted` 对应 `cancel`。

每个分类可以是一条字符串、字符串数组，或带 `text` 字段的对象数组。空行和非字符串项会被忽略。整份文件没有可用语录时，导入会被拒绝，已安装的语录包不会被覆盖。

## 语言与回退

语言键会归一化大小写及 `-` / `_`，因此 `zh-CN` 和 `zh_CN` 等价。每个语录包内部按照以下顺序查找：

1. 当前界面语言的精确匹配。
2. 基础语言，例如 `zh_CN` 回退到 `zh`。
3. `en`。
4. 文件中第一个包含该分类的语言。

每个分类先尝试独立语录，再尝试全局语录。戳一戳在两者都没有可用内容时，还会使用 `pet.json` 的 `quotes` / `pokeQuotes`，最后显示内置问候。其他事件保留原有消息。

## 待机语录什么时候出现

当没有活跃 Agent 会话、桌宠可见且当前没有说话时，每 2–5 分钟会显示一条待机语录。有多个候选句子时不会连续重复同一句；切换语言后，下一句即采用新语言。

## 保存位置

```text
全局：%APPDATA%\Ni-ShuWu\At-Pet\quotes.json
独立：%APPDATA%\Ni-ShuWu\At-Pet\pet-quotes\<ID>.json
```

独立文件以经过 URL 编码的宠物库 ID 命名。语录不会写入 `pet.json`，切换、更新或重新导入桌宠不会覆盖全局语录。
