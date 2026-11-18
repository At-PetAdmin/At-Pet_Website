---
title: 构建与贡献
description: 准备 Windows 构建环境，从源码运行 At-Pet，或为项目贡献改进。
section: Agent 与开发
order: 11
source: https://github.com/At-PetAdmin/At-Pet/blob/main/README_CN.md
---

## 桌面应用构建环境

本页介绍 At-Pet 桌面应用的构建。网站本身的开发命令见网站仓库的 README。

根据上游 Windows / Qt MinGW 构建说明，准备：

- Windows 10 / 11。
- Qt 6.4+，包含 Widgets、Network 和 LinguistTools。
- CMake 3.21+ 与 Ninja。
- 与 Qt 套件兼容的 MinGW 编译器。

务必使用匹配的 Qt 套件与编译器架构。

## 获取并构建源码

```powershell
git clone https://github.com/At-PetAdmin/At-Pet.git
cd At-Pet
```

以下示例使用上游文档中的 `E:\Qt\6.11.2` 路径。请按本机安装位置修改，示例路径不是必需的安装位置。

```powershell
cmake -S . -B build -G Ninja `
  -DCMAKE_PREFIX_PATH="E:/Qt/6.11.2/mingw_64" `
  -DCMAKE_MAKE_PROGRAM="E:/Qt/Tools/Ninja/ninja.exe" `
  -DCMAKE_C_COMPILER="E:/Qt/Tools/mingw1310_64/bin/gcc.exe" `
  -DCMAKE_CXX_COMPILER="E:/Qt/Tools/mingw1310_64/bin/g++.exe"

cmake --build build
```

## 运行与部署 Qt

运行 `build\at-pet.exe` 时，将对应 Qt 套件的 `bin` 目录加入 `PATH`，或者使用该套件的 `windeployqt` 部署 Qt 运行时。

没有本地 Qt 环境时，也可以在 [GitHub Actions](https://github.com/At-PetAdmin/At-Pet/actions) 下载自包含的 Windows 构建产物来验证改动。具体获取方式见 [下载与安装](../installation/)。

## 参与贡献

提交前阅读上游的 [中文贡献指南](https://github.com/At-PetAdmin/At-Pet/blob/main/CONTRIBUTING_CN.md)，了解构建方式、代码约定和提交流程。

你可以从这些地方开始：

- 在 [Issues](https://github.com/At-PetAdmin/At-Pet/issues) 报告可以复现的问题。
- 改进文档、示例或翻译。
- 制作桌宠与语录包，并核对素材的使用许可。
- 改进事件发送端，注明支持的生命周期事件及权限回传行为。

At-Pet 基于 MIT 许可发布。引用或分发上游源码与文档时，请保留其版权与许可声明。
