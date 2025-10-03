# Tica Detective Agency: Digital Mystery Cases

📖 [中文版 README](docs/README_cn.md)

---

A math learning game designed for children aged 8-10, teaching mathematical concepts through detective-themed interface and gamified design.

**Core Educational Objective**: This game is primarily designed to teach children how to quickly verify calculations using different methods, which is the core purpose of the game. Through various mathematical verification techniques (such as digit verification, parity checking, rule of 9s, etc.), it cultivates children's mathematical thinking and calculation confidence.

**🎭 Trivia**: Tica, the protagonist detective, is named after the developer's daughter!

## Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Build Production Version
```bash
npm run build
```

## Deploy to GitHub Pages

### Automatic Deployment (Recommended)

1. Push code to the `main` or `master` branch of the GitHub repository
2. Go to repository Settings → Pages
3. Set Source to "GitHub Actions"
4. Automatic deployment will occur with each push

### Manual Deployment

If manual deployment is needed:

```bash
# Build
npm run build

# Push to gh-pages branch (need to create first)
git checkout -b gh-pages
git add dist -f
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Return to main branch
git checkout main
```

### Custom Domain

Add CNAME record in GitHub Pages settings, or modify the `cname` field in `.github/workflows/deploy.yml`.

## Game Features

- 🕵️‍♀️ Detective-themed math learning game
- 📚 Suitable for children aged 8-10
- 🎯 Multiple math question types and difficulty levels
- 🏆 Achievement system and progress tracking
- 📱 PWA support for offline use

## Technology Stack

- **Game Engine**: Phaser 3.90.0
- **Build Tool**: Vite 4.x
- **Programming Language**: TypeScript
- **Testing Framework**: Jest
- **Deployment**: GitHub Pages

**Development Approach**: The main development was completed using Claude Code + Cursor.

## License

MIT License

