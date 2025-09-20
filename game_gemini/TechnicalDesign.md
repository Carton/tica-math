
#### **6. 技术实现规划 (Technical Implementation Plan)**

*   **游戏引擎:** **Phaser.js (v3)**。它提供了成熟的场景管理、物理引擎、动画系统和资源加载功能，非常适合开发2D网页游戏。

*   **项目结构 (场景驱动):**
    *   **`BootScene`:** 启动场景，负责加载 `PreloaderScene` 所需的最小资源。
    *   **`PreloaderScene`:** 加载游戏所需的所有资源（图片、音频、字体等），并显示加载进度条。
    *   **`MainMenuScene`:** 主菜单场景，即“侦探事务所”，包含“开始游戏”按钮和通往“侦探手册”、“荣誉墙”的入口。
    *   **`GameScene`:** 核心游戏场景，负责处理游戏逻辑，包括题目的显示、玩家输入、倒计时等。
    *   **`UIScene`:** UI 场景，独立于 `GameScene` 运行并渲染在其上层。负责显示分数、关卡数、进度条、道具按钮等静态UI元素。这可以避免UI元素随着游戏世界的镜头移动而移动。
    *   **`LevelEndScene`:** 关卡结算场景，显示“案件告破”或“让教授逃跑了”的动画和统计数据。

*   **核心模块设计:**
    *   **`QuestionGenerator.js`:** 一个独立的类/模块。
        *   `generate(difficultyConfig)` 方法接收一个难度配置对象（由 `DifficultyManager` 提供）。
        *   根据配置生成题目，包括 `questionString`, `isTrue`, `targetSkill` 等。
        *   与游戏场景完全解耦，方便测试和未来扩展。
    *   **`DifficultyManager.js`:**
        *   负责维护当前的关卡数和难度积分。
        *   `getCurrentDifficultyConfig()` 方法会根据当前积分，计算出具体的题目生成参数（数字范围、运算符等）。
        *   `levelUp()` 方法用于在关卡结束后增加难度积分。
        *   该模块将从一个外部JSON文件加载难度曲线配置，实现可调整性。
    *   **`DetectiveToolsManager.js`:**
        *   管理道具的可用次数。
        *   `useTool(toolName, question)` 方法会根据道具名称和当前题目，触发相应的游戏内事件（如在 `GameScene` 中显示提示动画，或通知 `UIScene` 增加计时器时间）。

*   **资源管理 (Asset Management):**
    *   所有资源路径集中在配置文件统一管理，优先使用 Texture Atlas / Multi-Atlas。
    *   字体通过 `this.load.font(key, url, 'opentype')` 直接加载 TTF/OTF，避免额外 WebFont 依赖。
    *   加载阶段使用 `PreloaderScene`，展示进度与提示；支持按需增量加载（关卡切换时只加载新增资源）。
    *   音频：区分 BGM 与 SFX 两类声道；BGM 循环播放、统一音量管理，SFX 使用音效池减少创建开销。

*   **状态管理 (State Management):**
    *   使用 Phaser 的 [Registry](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.DataManager) 共享跨场景状态（当前关卡、分数、徽章等）。
    *   通过事件总线（`this.game.events`）协调 `GameScene` 与 `UIScene`，例如：题目变化、计时变更、道具使用、关卡结束。
    *   轻量持久化：关键数据（最高等级、徽章）通过 `localStorage` 同步。

*   **缩放与分辨率 (Scale):**
    *   目标画布基准 1280×720。使用 `ScaleManager` 设置 `mode=FIT`、`autoCenter=CENTER_BOTH`，保证宽高比并自适应居中。
    *   监听 `scale.resize`，在 `UIScene` 中更新布局（进度条、按钮、提示区域）以适配不同视口。

*   **场景与流程 (Scenes & Flow):**
    *   `BootScene` → `PreloaderScene` → `MainMenuScene` → `GameScene` + `UIScene`（并行）→ `LevelEndScene`。
    *   `UIScene` 仅承载 HUD/按钮，不依赖 `GameScene` 相机；通过事件进行解耦通信。
    *   合理使用 `this.scene.launch/pause/resume/stop` 组合控制场景生命周期。

*   **时间与计时 (Time & Timeline):**
    *   每题倒计时使用 `this.time.addEvent({ delay: 1000, loop: true })` 驱动；道具“时间慢走”直接修改剩余秒数或 `timeScale`。
    *   关卡/结算过场采用 `Timeline` 将音效、Tween、提示按序编排，便于统一维护反馈节奏。

*   **输入与可用性 (Input & UX):**
    *   按钮统一 `setInteractive({ useHandCursor: true })`，扩大可点区域，移动端优先触控命中。
    *   支持键盘快捷：True/False 分别映射为 `ArrowLeft/ArrowRight` 或 `A/D`。
    *   防抖与禁用态：回答后短暂禁用按钮，避免连点误触；在动画/过渡期间锁输入。

*   **音频 (Audio):**
    *   背景音乐与音效分组控制；音量与静音状态保存在 Registry 并持久化。
    *   关键事件（正确/错误/通关/失败）绑定专属 SFX，强化即时反馈。

*   **核心模块细化:**
    *   `QuestionGenerator.js`
        *   纯函数或无副作用类：`generate(difficultyConfig): Question[] | Question`。
        *   返回结构包含 `questionString`, `isTrue`, `targetSkill`，便于道具联动。
        *   单元测试覆盖：正确题/策略性错误题的分布与字段完整性。
    *   `DifficultyManager.js`
        *   从外部 JSON 读取曲线；提供 `getCurrentDifficultyConfig()`、`levelUp()`、`reset()`。
        *   输出可控参数：数字范围、运算符概率、时间限制、混合运算开关。
    *   `DetectiveToolsManager.js`
        *   跟踪每关剩余次数；`useTool(toolName, question)` 发出对应事件（如 `TOOLS/MAGNIFY`, `TOOLS/SLOW_TIME`, `TOOLS/INSIGHT`）。
        *   与 `UIScene` 协作处理视觉提示与计时修改；与 `GameScene` 协作修改题面装饰与提示文案。

*   **测试 (Unit / E2E):**
    *   单元测试：`QuestionGenerator` 策略性错误生成、`DifficultyManager` 曲线边界、`DetectiveToolsManager` 次数与事件。
    *   集成/E2E：模拟 10 题流程与评分阈值、倒计时与道具交互（时间增加正确生效）、多分辨率下 UI 点击准确性。

*   **性能与包体:**
    *   使用 Multi-Atlas 合并小图；对大图开启压缩；视频与大音频按需加载。
    *   开发期启用 Vite 分包与缓存；生产构建剔除未用场景与调试代码。

* * *

*   **推荐 GameConfig 配置 (示例):**
    ```js
    import Phaser, { AUTO } from 'phaser';
    import BootScene from './scenes/BootScene';
    import PreloaderScene from './scenes/PreloaderScene';
    import MainMenuScene from './scenes/MainMenuScene';
    import GameScene from './scenes/GameScene';
    import UIScene from './scenes/UIScene';
    import LevelEndScene from './scenes/LevelEndScene';

    const config = {
      type: AUTO,
      parent: 'game-root',
      backgroundColor: '#0f1320',
      width: 1280,
      height: 720,
      pixelArt: true,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [
        BootScene,
        PreloaderScene,
        MainMenuScene,
        GameScene,
        UIScene,
        LevelEndScene
      ],
      audio: {
        disableWebAudio: false
      },
      input: {
        gamepad: true
      }
    };

    export default new Phaser.Game(config);
    ```

*   **事件命名空间约定 (Events Namespace):**
    *   全局事件走 `this.game.events`；场景内局部事件走 `this.events`。
    *   命名采用 `域/动作` 的层级式字符串，便于筛选与日志聚合：
        *   `GAME/START`，`GAME/PAUSE`，`LEVEL/START`，`LEVEL/END`。
        *   `QUESTION/NEXT`，`QUESTION/ANSWERED`。
        *   `TIMER/TICK`，`TIMER/ADD_SECONDS`。
        *   `TOOLS/MAGNIFY`，`TOOLS/SLOW_TIME`，`TOOLS/INSIGHT`。
        *   `AUDIO/BGM/PLAY`，`AUDIO/SFX/PLAY`。
    *   参数统一以对象传递：`{ payload, meta }`，其中 `meta` 可包含时间戳、来源场景等。

*   **Registry 键名规范 (Registry Keys):**
    *   采用 `kebab-case` 或 `namespace:key` 两种之一，项目内保持一致；推荐 `namespace:key`：
        *   `game:level`（当前关卡）
        *   `game:score`（累计得分）
        *   `game:badges`（已解锁徽章数组）
        *   `audio:volume:music`，`audio:volume:sfx`，`audio:muted`
        *   `difficulty:score`（难度积分）
        *   `tools:remaining`（本关剩余道具使用次数，或细分到道具名）
    *   读写建议：
        *   批量设值：`this.registry.set({ 'game:level': 1, 'game:score': 0 })`。
        *   事件融合：写后通过 `this.game.events.emit('REGISTRY/UPDATED', { keys: [...] })` 通知 UI 刷新。
    *   持久化建议：
        *   仅持久化长期数据（最高等级、徽章、音量/静音），使用 `localStorage`：
          - 读：启动时从 `localStorage` 合并到 Registry。
          - 写：在相应事件（如 `LEVEL/END`、`AUDIO/CHANGED`）上同步。
