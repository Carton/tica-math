# Tica侦探事务所：数字谜案

一款为8-10岁儿童设计的数学学习游戏，通过侦探主题的界面和游戏化设计来教授数学概念。

**核心教学目标**：这个游戏主要是为了教孩子怎么用不同的方法来快速验算，这是游戏的核心目的。通过多种数学验算技巧（如个位数验证、奇偶性检查、9的倍数法则等），培养孩子们的数学思维和计算自信心。

**🎭 趣闻**：主角侦探Tica是以开发者的女儿命名的！

## 开发

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 运行测试
```bash
npm test
```

### 构建生产版本
```bash
npm run build
```

## 部署到GitHub Pages

### 自动部署（推荐）

1. 将代码推送到GitHub仓库的 `main` 或 `master` 分支
2. 前往仓库设置 → Pages
3. 设置 Source 为 "GitHub Actions"
4. 自动部署将在每次推送后进行

### 手动部署

如果需要手动部署，可以：

```bash
# 构建
npm run build

# 推送到gh-pages分支（需要先创建）
git checkout -b gh-pages
git add dist -f
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 回到主分支
git checkout main
```

### 自定义域名

在GitHub Pages设置中添加CNAME记录，或修改 `.github/workflows/deploy.yml` 中的 `cname` 字段。

## 游戏特性

- 🕵️‍♀️ 侦探主题的数学学习游戏
- 📚 适合8-10岁儿童
- 🎯 多种数学题型和难度
- 🏆 成就系统和进度追踪
- 📱 支持PWA，可离线使用

## 技术栈

- **游戏引擎**: Phaser 3.90.0
- **构建工具**: Vite 4.x
- **开发语言**: TypeScript
- **测试框架**: Jest
- **部署**: GitHub Pages

**开发方式**：主要开发都是 claude code + Cursor 完成的。

## 许可证

MIT License
