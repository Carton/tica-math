
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
    *   所有资源路径将集中在一个配置文件中管理。
    *   图片资源将使用 Texture Atlas (纹理图集) 进行打包，以优化加载速度和性能。
    *   音频将使用 Phaser 的音频管理器加载，区分背景音乐 (Music) 和音效 (Sound)。

*   **状态管理 (State Management):**
    *   使用 Phaser 的 [Registry](https://newdocs.phaser.io/docs/3.70.0/Phaser.Data.DataManager) 来存储全局游戏状态，如当前关卡、总得分、已解锁的徽章等。这使得数据可以在不同场景之间轻松共享。

* * *
