---
title: 动画与 pet.json
description: 用一份 JSON，把精灵表里的每个动作交给桌宠。
section: 桌宠指南
order: 6
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 一个基础配置

下面的示例假设精灵表每帧为 128 × 128 像素，每行放置 4 帧，前三行分别为空闲、行走和睡眠。根据你的实际图片调整这些数值。

```json
{
  "name": "My Little Cat",
  "sprite": "spritesheet.png",
  "cell": [128, 128],
  "scale": 1.5,
  "fps": 8,
  "defaultAnimation": "idle",
  "animations": {
    "idle": { "row": 0, "frames": 4 },
    "walk": { "row": 1, "frames": 4 },
    "sleep": { "row": 2, "frames": 4, "fps": 4 }
  },
  "animationGroups": {
    "rest": ["idle", "sleep"]
  },
  "quotes": ["我在这儿陪你。", "记得休息一下！"]
}
```

## 基础字段

| 字段 | 用途 |
| --- | --- |
| `name` | 桌宠名称 |
| `sprite` | 精灵表文件名，也接受 `spriteSheet` |
| `cell` | 单帧宽高，支持数组或带 `width` / `height` 的对象 |
| `scale` | 显示缩放比例 |
| `fps` | 全局默认帧率 |
| `defaultAnimation` | 默认动画名称 |
| `animations` | 动画名称与帧配置的映射 |

也可以用 `frameWidth` 和 `frameHeight` 指定帧尺寸。

## 行、帧与速度

`row` 从 **0** 开始，`frames` 表示该行连续帧数。每个动画可以独立设置 `fps`（1–30），未设置时继承全局值。

还支持旧式包含首尾的 `start` / `end` 范围，或显式帧索引数组。显式索引从 0 开始，按精灵表的行优先顺序计数。

```json
{
  "walk": { "frames": [12, 13, 14, 15, 16, 17], "fps": 10 }
}
```

你也可以在应用设置中的桌宠预览里，为每只桌宠的每个动画调速。该偏好保存在应用设置中，不会修改导入的 `pet.json`。

## 常用动画名称

| 名称 | 对应状态 |
| --- | --- |
| `idle` / `walk` / `sleep` | 空闲、行走、睡眠 |
| `thinking` / `work` / `review` | 思考、工作、审阅 |
| `tool` / `permission` | 工具执行、权限请求 |
| `done` / `cancelled` / `error` | 完成、取消、错误 |
| `interact` | 互动 |

缺少对应动画时不必放置空白行。上游会跳过缺失的动画，并保留上一帧；语录仍可显示。

## 左右行走

可以定义 `walkLeft` 与 `walkRight`，也接受 `walk_left` / `walk_right` 或 `walk-left` / `walk-right`。

方向专用动画会按原图绘制，不会额外镜像。没有专用动画时回退到 `walk`，向左移动会镜像共用动画，因此共用的 `walk` 应画成朝右。行走方向优先于鼠标注视带来的翻转。

## 休息动画组

`animationGroups.rest` 可让桌宠在空闲时轮换动画，例如 `idle` 与 `sleep`。它会每隔 8–20 秒切换一次，并保持 3.5–9 秒；不存在的动画名称会被忽略。

`rest` 支持逗号分隔的字符串、名称数组，或包含 `name` 字段的对象数组。

上游也兼容 `row_counts`，其行顺序依次为 idle、walk、sleep、thinking、work、review、error、done、cancelled、tool、interact。新配置建议使用具名的 `animations`，方便核对每个动作。
