### Tica 侦探事务所：数字谜案 — 实现方案 (Phaser 3.90.0)

> 本方案基于《docs/Spec.md》与《docs/game_questions.md》的已确认决策，目标平台为桌面浏览器，固定横屏，支持离线可玩。

---

## 一、技术与运行环境
- **引擎与版本**: Phaser 3.90.0
- **构建**: Vite (ESM)，开发端口 3000
- **分辨率/缩放**: 1280×720 基准；`Scale.FIT + CENTER_BOTH`；在超宽/超高比例下对 UI 采用最小/最大缩放夹紧
- **目标帧率**: 60fps（尽量减少每帧分配与重排）
- **离线支持**: 引入 PWA 方案（vite-plugin-pwa），预缓存构建产物与静态资源
- **语言**: 首发中文，保留 i18n 扩展点（字符串集中化）

---

## 二、总体架构与目录
```
src/
  index.html                // 入口（Vite root=src）
  main.ts                   // 启动 Phaser.Game
  game/
    config/
      gameConfig.ts         // Scale/Physics/Sound 配置
      difficulty.json       // 难度曲线（可热更新，dev 动态加载）
      strings.zh-CN.json    // UI 文本/秘籍文案（可扩展 i18n）
    managers/
      DifficultyManager.ts  // 读取 difficulty.json，提供参数查询
      QuestionGenerator.ts  // 题目生成（含策略性错误、多标签 targetSkills）
      ToolManager.ts        // 三种道具逻辑与限制（全局3次、可叠加）
      SaveManager.ts        // 本地存档 localStorage
      AudioManager.ts       // BGM/SFX 声道与播放封装
      EventBus.ts           // 轻量事件总线（基于 Phaser.Events 或自研 Emitter）
    scenes/
      BootScene.ts          // 引导（高优先级配置加载）
      PreloadScene.ts       // 预加载占位资源、字体、音频
      MainMenuScene.ts      // 主界面：开始破案、手册、荣誉入口
      GameScene.ts          // 关卡主循环：10题流程、答题/计时/进度
      UIScene.ts            // UI 覆盖：按钮、进度、倒计时（Fuse样式）、道具栏
      ResultScene.ts        // 结算评级、徽章、再来一次
    utils/
      mathUtils.ts          // 常用数学/随机工具、表达式构建
      scoring.ts            // 成绩与评级计算（含道具惩罚、连击/速度加成）
      types.ts              // 统一类型定义
assets/
  images/                   // 占位图与简单纹理
  audio/                    // 占位 BGM/SFX
  fonts/                    // 占位字体（TTF/OTF）
```

- UI 与游戏逻辑通过 `EventBus` 解耦；`UIScene` 覆盖渲染于 `GameScene` 之上。
- 音频区分 BGM 与 SFX；资源采用分散图片，后期可合并为 Atlas。

---

## 三、关键模块职责
- BootScene
  - 读取 `difficulty.json` 与 `strings.zh-CN.json` 的哈希/版本；设置缩放策略与全局事件侦听；跳转 PreloadScene
- PreloadScene
  - 预加载占位资源（Emoji 文本渲染、占位图片/音频、占位字体），显示简单进度条
- MainMenuScene
  - 显示“开始破案”、进入“侦探手册”（秘籍Cheatsheet）与“荣誉墙”（徽章列表）入口
- GameScene
  - 关卡驱动（固定 10 题，数量可配置）；向 `QuestionGenerator` 请求题目；收集答题用时/正确性；触发判题与计分
- UIScene
  - 真相/伪证按钮（印章交互与音效，支持键盘 T/F/←/→），倒计时（燃烧导火索风格），进度条，连击/反馈特效，道具栏（🔍/⏱️/⚡）
- ResultScene
  - 展示成绩（正确率、用时、评级 S/A/B/C），道具使用影响评级；发放徽章与经验；再来一次
- DifficultyManager
  - 提供按当前“难度积分”查询参数：数字范围、运算符启用、出现概率（阶梯）、时间限制、三数字与括号的出现、题量等
- QuestionGenerator
  - 依据难度与 flags（分数/小数/负数）生成“正确等式”，再按 50% 概率制造“策略性错误”（与 targetSkills 对齐）；支持多标签
- ToolManager
  - 全局 3 次使用上限（共享冷却）；单题可叠加；实现三种道具的效果；发事件驱动 UI 提示与计时调整
- SaveManager
  - 本地存档：最高等级、累计徽章、经验、最近成绩；序列化/反序列化；版本兼容
- AudioManager
  - BGM/SFX 管理、音量统一控制、播放封装（盖章/错误/成功/连击/通过）

---

## 四、事件总线（建议事件名）
- lifecycle
  - `boot:ready`
  - `game:start` 载入关卡参数
  - `game:end` 提交结果
- question
  - `question:new` { question: Question }
  - `question:answer` { isCorrect: boolean, timeMs: number }
  - `question:timeout`
- ui
  - `ui:countdown:start` { totalMs }
  - `ui:countdown:tick` { remainingMs }
  - `ui:countdown:extend` { deltaMs } // 怀表
  - `ui:feedback` { type: 'correct'|'wrong'|'timeout'|'combo'|'speed' }
- tools
  - `tool:use` { type: 'magnify'|'watch'|'flash' }
  - `tool:hints` { targetSkills: SkillTag[], hint: string }
- progress
  - `progress:update` { index: number, total: number }
- audio
  - `audio:play` { key: string }

---

## 五、数据结构（TypeScript 约定）
- Question
  - `questionString: string` 例 "145 + 289 = 434"
  - `isTrue: boolean`
  - `targetSkills: SkillTag[]` 多标签
  - `metadata: { expr: string; correctValue: number; shownValue: number }`
- SkillTag (枚举)
  - `estimate`, `lastDigit`, `parity`, `castingOutNines`, `carryBorrow`, `specialDigits(3|5|9|10)`, `inverseOp`, `times11`
- DifficultyParams（由 DifficultyManager 提供）
  - `numberRange: { min: number; max: number }` // 控制到三位（<=999）
  - `operators: { plus: boolean; minus: boolean; mul: boolean; div: boolean }`
  - `operatorWeights: { plus: number; minus: number; mul: number; div: number }` // 阶梯概率
  - `allowFractions: boolean`（默认 false）
  - `allowDecimals: boolean`（默认 false）
  - `allowNegative: boolean`（默认 false）
  - `threeTermsProbability: number` // 出现第三个数字/混合运算的概率
  - `allowParentheses: boolean`
  - `timePerQuestionMs: number` 与 `minTimeMs`
  - `questionCount: number` 默认 10
- ToolState
  - `remainingUses: number` 全局 3
- Result
  - `correctCount: number`, `totalCount: number`, `totalTimeMs: number`, `averageTimeMs: number`, `comboMax: number`, `toolsUsed: number`
  - `grade: 'S'|'A'|'B'|'C'` 与 `badgeEarned?: string`

---

## 六、难度配置（difficulty.json 草案）
```json
{
  "levels": [
    {
      "level": 1,
      "numberRange": { "min": 1, "max": 20 },
      "operators": { "plus": true, "minus": true, "mul": false, "div": false },
      "operatorWeights": { "plus": 0.7, "minus": 0.3, "mul": 0, "div": 0 },
      "allowFractions": false,
      "allowDecimals": false,
      "allowNegative": false,
      "threeTermsProbability": 0.0,
      "allowParentheses": false,
      "timePerQuestionMs": 15000,
      "minTimeMs": 8000,
      "questionCount": 10
    },
    {
      "level": 5,
      "numberRange": { "min": 10, "max": 99 },
      "operators": { "plus": true, "minus": true, "mul": true, "div": false },
      "operatorWeights": { "plus": 0.5, "minus": 0.3, "mul": 0.2, "div": 0 },
      "allowFractions": false,
      "allowDecimals": false,
      "allowNegative": false,
      "threeTermsProbability": 0.15,
      "allowParentheses": false,
      "timePerQuestionMs": 13000,
      "minTimeMs": 7000,
      "questionCount": 10
    },
    {
      "level": 10,
      "numberRange": { "min": 50, "max": 999 },
      "operators": { "plus": true, "minus": true, "mul": true, "div": true },
      "operatorWeights": { "plus": 0.35, "minus": 0.25, "mul": 0.25, "div": 0.15 },
      "allowFractions": false,
      "allowDecimals": false,
      "allowNegative": false,
      "threeTermsProbability": 0.35,
      "allowParentheses": true,
      "timePerQuestionMs": 11000,
      "minTimeMs": 6000,
      "questionCount": 10
    }
  ]
}
```
- 说明：
  - 采用“阶梯”策略；可插值或就近选择；可通过“速率”参数整体平移/收紧（实现难度提升速率可控）。

---

## 七、题目生成逻辑（QuestionGenerator）
- 步骤
  1) 从 DifficultyParams 抽取目前的范围与运算符概率，采样表达式结构：
     - 二项或三项；是否插入括号；遵循乘除优先
  2) 生成一个“正确”表达式与其正确值（整数/可控负数/是否允许小数/分数由 flags 控制）
  3) 50% 直接给出正确等式；50% 制造“策略性错误”：
     - 与 `targetSkills` 紧密对应：
       - 尾数追踪术（lastDigit）：仅篡改结果个位（±1、±2 等）
       - 估算神功（estimate）：在估算范围边界处轻微偏移
       - 奇偶密码（parity）：令乘积/和差的奇偶与规律矛盾
       - 弃九验算法（castingOutNines）：使数位和 mod 9 不一致
       - 进位/借位陷阱（carryBorrow）：在近位处制造 ±10 的错差
       - 特殊数字指纹（3/5/9/10）：围绕 5/10 尾数或 3/9 可整除性制造矛盾
       - 逆运算大法（inverseOp）：构造反向检验下不可成立的数值
       - 和11交朋友（times11）：两位数×11 规律被破坏
  4) 产出 `Question`：`questionString`, `isTrue`, `targetSkills[]`, `metadata`
- 约束
  - 默认不出分数/小数/负数（可在配置打开）；除法默认整除（或在允许小数时保留一位/两位）
  - 允许结果为 0 或一位数；最大三位数上限 999

---

## 八、道具系统（ToolManager）
- 全局可用次数：3（跨整关共享）；单题允许叠加
- 三种道具
  - 真相放大镜 magnify (🔍)：根据 `targetSkills` 标注关键视觉（如个位数圈出）与展示对应口诀（来自 `strings.zh-CN.json`）
  - 时间慢走怀表 watch (⏱️)：当前题倒计时 +10s（或配置化）
  - 思维闪电 flash (⚡)：输出二元提示（如“尾数计算错误/正确”），不直接给出答案
- 评分影响：使用次数越多，评级下调（阈值见评分公式）

---

## 九、评分与反馈（scoring.ts）
- 评级分档（默认）：
  - S: 正确率 ≥ 90%
  - A: 80% ≤ 正确率 < 90%
  - B: 65% ≤ 正确率 < 80%
  - C: 其它
- 惩罚与加成：
  - 道具惩罚：使用 1/2/3 次分别对最终评级作轻微下调（如阈值上调 2/4/7个百分点）
  - 连击奖励：达到 3/5/8 Combo 播放正向反馈音效与视觉
  - 速度鼓励：在 `speedThresholdMs` 以内答对触发 `ui:feedback('speed')`

---

## 十、UI/UX 细节
- 真相/伪证按钮：印章风格（点击盖章动画与 SFX）；键盘快捷键 T/F 或 ←/→
- 倒计时：燃烧导火索风格（初期无粒子，后续可加）；支持 `extend` 动画
- 字体：占位字体（如 OpenSans/Inter 占位），最终建议在《docs/Assets.md》中列出教育字体候选
- 色彩：卡通风格；正确为绿色、错误为红色，强调即时反馈

---

## 十一、资源与占位（初版清单）
- images/
  - `bg_office.png` 侦探事务所/调查桌面背景（可用纯色/噪声纹理占位）
  - `paper_note.png` 题目便签纸
  - `stamp_true.png` / `stamp_false.png`（可先用 Emoji ✅/❌ 文本渲染代替）
  - `icons_magnify.png`/`icons_watch.png`/`icons_light.png`（先用 🔍/⏱️/⚡）
- audio/
  - `bgm_loop.ogg` 低音量循环 BGM（卡通）
  - `sfx_click.mp3`, `sfx_stamp.mp3`, `sfx_wrong.mp3`, `sfx_success.mp3`, `sfx_combo.mp3`
- fonts/
  - `UI_Sans_Placeholder.ttf`（占位）

资源替换指南：将于《docs/Assets.md》给出尺寸、格式、命名、打包建议（含推荐教育字体清单）。

---

## 十二、依赖与工程调整
- 升级 `phaser` 至 `3.90.0`
- 为离线：`vite-plugin-pwa`
- 事件总线：优先使用 `Phaser.Events.EventEmitter` 封装，避免额外依赖
- 测试：保留 Jest；端到端建议引入 Playwright（可选）

---

## 十三、文件变更清单（实施时新增/修改）
- 新增：`src/index.html`, `src/main.ts`
- 新增：`src/game/config/gameConfig.ts`, `src/game/config/difficulty.json`, `src/game/config/strings.zh-CN.json`
- 新增：`src/game/managers/*`（Difficulty/Question/Tool/Save/Audio/EventBus）
- 新增：`src/game/scenes/*`（Boot/Preload/MainMenu/Game/UIScene/Result）
- 新增：`src/game/utils/mathUtils.ts`, `src/game/utils/scoring.ts`, `src/game/utils/types.ts`
- 新增：占位资源 `src/assets/{images,audio,fonts}` 与加载
- 修改：`package.json`（依赖 phaser@3.90.0，PWA 插件脚本）
- 新增：`docs/Assets.md`（资源替换指南）

---

## 十四、测试计划
- 单元测试（Jest）
  - QuestionGenerator：
    - 生成表达式合法性（遵循 flags 与范围）
    - 策略性错误与 `targetSkills` 一致性（尾数/奇偶/弃九等）
  - DifficultyManager：按等级返回参数正确；时间与概率曲线阶梯逻辑
  - ToolManager：次数限制、叠加效果、事件发送
  - scoring：评级分档、道具惩罚、速度/连击加成
- 端到端（Playwright，可选）
  - 启动 → 菜单 → 进入关卡 → 10题交互 → 结算
  - 键盘快捷键、按钮盖章反馈、倒计时延长、道具提示
- 覆盖率门槛（建议）
  - 语句 ≥ 70%，分支 ≥ 60%

---

## 十五、验收标准
- 能稳定运行在桌面浏览器（Chromium/Firefox）60fps 左右
- 题目生成符合配置，策略性错误与秘籍提示一致
- 10 题流程闭环；结算评级按规则生效（含道具影响）
- 离线可用（首次访问后断网可运行）
- 占位资源可被后续替换，存在《docs/Assets.md》指南

---

## 十六、后续路线图
- 增加粒子/演出；Atlas 化与资源优化
- 成就/徽章系统内容扩展；单关难度自适应（基于表现实时微调）
- 完整 i18n 与可达性

---

## 十七、运行与调试
- 开发：`npm run dev` → http://localhost:3000
- 构建：`npm run build`，预览 `npm run preview`
- 测试：`npm run test`（单元）；端到端另行脚本（如 `npm run e2e`）
