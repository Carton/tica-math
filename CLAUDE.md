# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Phaser 3.90.0 的教育类数学游戏项目，名为 "Tica侦探事务所：数字谜案"，面向8-10岁儿童，通过侦探主题的界面和游戏化设计来教授数学概念。

## 常用命令

### 开发和构建
```bash
npm run dev          # 启动开发服务器 (端口3000)
npm run build        # TypeScript编译 + Vite构建
npm run preview      # 预览构建结果
```

### 测试和质量检查
```bash
npm test            # 运行所有测试
npm run test:watch  # 监听模式运行测试
npm run lint        # ESLint代码检查
npm run lint:fix    # 自动修复ESLint问题
```

## 架构概览

### 技术栈
- **游戏引擎**: Phaser 3.90.0 (ESM版本)
- **构建工具**: Vite 4.x
- **开发语言**: TypeScript
- **测试框架**: Jest + jsdom环境
- **代码规范**: ESLint + TypeScript ESLint

### 项目结构
```
src/
├── main.ts                    # 游戏入口点
├── index.html                 # HTML入口
├── assets/                    # 静态资源(音频、字体、图片)
└── game/
    ├── config/
    │   └── gameConfig.ts      # Phaser游戏配置
    ├── managers/              # 核心管理器
    │   ├── DifficultyManager.ts
    │   ├── EventBus.ts
    │   ├── QuestionGenerator.ts
    │   ├── SaveManager.ts
    │   ├── Strings.ts
    │   └── ToolManager.ts
    ├── scenes/                # 游戏场景
    │   ├── BootScene.ts
    │   ├── PreloadScene.ts
    │   ├── MainMenuScene.ts
    │   ├── GameScene.ts
    │   ├── UIScene.ts
    │   ├── ResultScene.ts
    │   ├── HonorScene.ts
    │   └── ManualScene.ts
    └── utils/                 # 工具函数
        ├── gameFlow.ts
        ├── mathUtils.ts
        ├── scoring.ts
        └── types.ts
```

### 核心架构模式

1. **场景系统**: 采用Phaser的标准场景架构，各场景职责明确：
   - `BootScene`: 初始化游戏配置
   - `PreloadScene`: 资源预加载
   - `MainMenuScene`: 主菜单界面
   - `GameScene`: 核心游戏逻辑
   - `UIScene`: UI渲染层(覆盖在GameScene之上)
   - `ResultScene`: 关卡结算
   - `HonorScene`: 荣誉墙/成就系统
   - `ManualScene`: 游戏说明

2. **事件驱动**: 使用`EventBus`实现模块间解耦通信

3. **管理器模式**: 各个管理器负责特定功能领域：
   - `DifficultyManager`: 难度递增系统
   - `QuestionGenerator`: 数学题目生成(核心业务逻辑)
   - `ToolManager`: 侦探道具系统
   - `SaveManager`: 数据持久化
   - `Strings`: 国际化和文本管理

4. **UI分层**: `UIScene`独立于`GameScene`，确保UI不受游戏相机影响

### 游戏机制

**核心玩法**: 玩家扮演小侦探Tica，通过判断数学等式的真伪来"破解案件"

- **题目生成**: 基于难度系统自动生成数学题目，包含错误答案的策略性生成
- **道具系统**: 每关可使用3次道具(真相放大镜、时间怀表、思维闪电)
- **进度系统**: 基于难度积分的无尽关卡模式
- **成就系统**: 徽章收集和侦探等级

## 开发指南

### 路径别名配置
项目已配置以下路径别名(在tsconfig.json和vite.config.ts中)：
- `@/*` → `src/*`
- `@/game/*` → `src/game/*`
- `@/assets/*` → `src/assets/*`

### 测试约定
- 测试文件放在`tests/`目录下
- 使用`.test.ts`或`.spec.ts`后缀
- 测试配置已设置路径别名映射
- 排除`main.ts`和测试文件本身的覆盖率统计

### 代码规范
- 使用TypeScript严格模式
- ESLint规则已优化，允许在测试文件中使用`any`
- 强制使用`const`和箭头函数
- 优先使用类型导入

### 构建配置
- **输出目录**: `dist/`
- **源代码根目录**: `src/`
- **资源目录**: `src/assets/`
- **开发服务器端口**: 3000
- **PWA支持**: 已配置vite-plugin-pwa

## 重要注意事项

1. **Phaser配置**: 游戏使用1280×720基准分辨率，采用FIT缩放模式
2. **性能优化**: Phaser依赖已在Vite中预优化
3. **跨平台**: 支持PC/平板浏览器，响应式设计
4. **中文本地化**: 游戏内容主要为中文，HTML设置`lang="zh-CN"`
5. **主题设计**: 深色主题背景色`#0b1021`

## 文档参考

详细的游戏规格说明请参考`docs/Spec.md`文件，包含完整的设计文档、游戏机制和业务逻辑说明。