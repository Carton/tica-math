# 🎮 游戏调试助手使用说明

## 📋 概述

为了方便快速测试不同关卡的效果，我为您创建了一套完整的调试工具，包括控制台命令和可视化调试面板。

## 🚀 快速开始

### 方法1：可视化调试面板（推荐）

开发环境下，游戏右上角会自动显示调试面板：

1. **设置关卡**：输入关卡数（1-100），点击"应用"
2. **添加道具**：点击"添加道具 +5"获得额外道具
3. **重置游戏**：完全重置游戏进度
4. **隐藏面板**：不需要时可以隐藏面板

### 方法2：控制台命令

在浏览器控制台（F12）中直接使用：

```javascript
// 设置关卡为50
DebugHelper.setLevel(50)

// 设置关卡为50，保留经验值和徽章
DebugHelper.setLevel(50, { keepExp: true, keepBadges: true })

// 添加道具（+10放大镜，+5手表，+3提示灯）
DebugHelper.addTools(10, 5, 3)

// 重置游戏
DebugHelper.resetGame()

// 查看当前调试信息
DebugHelper.getDebugInfo()

// 重载游戏应用更改
DebugHelper.reloadGame()
```

### 方法3：快捷键

- **Ctrl+Shift+D**：显示/隐藏调试面板
- **Ctrl+Shift+L**：弹出输入框快速设置关卡

## 🔧 API 详细说明

### DebugHelper.setLevel(level, options)

设置游戏关卡

**参数：**
- `level` (number): 目标关卡数 (1-100)
- `options` (object, 可选): 额外选项
  - `keepExp` (boolean): 是否保留经验值，默认false
  - `keepBadges` (boolean): 是否保留徽章，默认false
  - `resetTools` (boolean): 是否重置道具，默认false

**示例：**
```javascript
// 简单设置关卡
DebugHelper.setLevel(75)

// 设置关卡但保留进度
DebugHelper.setLevel(75, {
  keepExp: true,
  keepBadges: true,
  resetTools: false
})
```

### DebugHelper.addTools(magnify, watch, light)

添加道具

**参数：**
- `magnify` (number): 放大镜数量
- `watch` (number): 手表数量
- `light` (number): 提示灯数量

**示例：**
```javascript
// 添加5个放大镜，3个手表，2个提示灯
DebugHelper.addTools(5, 3, 2)
```

### DebugHelper.getDebugInfo()

获取当前游戏状态

**返回：**
```javascript
{
  currentLevel: 50,     // 当前关卡
  bestLevel: 50,        // 最高通关关卡
  exp: 1250,           // 经验值
  badges: ['...'],     // 徽章列表
  tools: {             // 道具数量
    magnify: 8,
    watch: 6,
    light: 4
  },
  isDevelopment: true  // 是否为开发环境
}
```

## 🎯 使用场景

### 1. 测试特定难度关卡
```javascript
// 测试85级（高难度）
DebugHelper.setLevel(85)
```

### 2. 验证配置效果
```javascript
// 测试不同配置下的游戏体验
DebugHelper.setLevel(30)  // 中等难度
DebugHelper.setLevel(70)  // 高难度
DebugHelper.setLevel(100) // 最高难度
```

### 3. 道具充足测试
```javascript
// 给足道具，专注测试游戏逻辑
DebugHelper.addTools(50, 50, 50)
```

### 4. 边界条件测试
```javascript
// 测试最低和最高关卡
DebugHelper.setLevel(1)
DebugHelper.setLevel(100)
```

## ⚠️ 注意事项

1. **开发环境限制**：调试助手仅在开发环境或localhost下可用
2. **数据安全**：生产环境中调试功能会自动禁用
3. **刷新生效**：修改关卡后需要刷新页面或调用reloadGame()
4. **范围限制**：关卡数建议在1-100之间

## 🔍 故障排除

**调试面板不显示？**
- 确保在localhost环境下访问
- 检查控制台是否有错误信息
- 尝试使用快捷键 Ctrl+Shift+D 显示

**设置关卡无效？**
- 确保输入的关卡数在有效范围内
- 检查浏览器是否允许localStorage
- 尝试刷新页面

**道具不显示？**
- 道具会在进入游戏时生效
- 确保当前场景为游戏场景
- 检查UI界面是否正常显示

## 🎨 自定义调试

如果需要更多调试功能，可以在 `src/utils/debugHelper.ts` 中扩展：

```typescript
// 添加自定义调试功能
static customDebug() {
  // 你的自定义逻辑
}
```

---

**版本**: 1.0
**更新日期**: 2025年10月2日
**维护者**: 调试助手团队