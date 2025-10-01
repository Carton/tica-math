### 资源清单与生成指引（像素律所·可爱悬疑风）

背景：这是一个基于 Phaser 3.90.0 的教育类数学游戏项目，名为 "Tica侦探事务所：数字谜案"，面向8-10岁儿童，通过侦探主题的界面和游戏化设计来教授数学概念。游戏风格采用“可爱像素+轻悬疑”风格，目标受众约 10 岁女孩。

以下为可直接用于 AI 生成工具（如 `https://aistudio.google.com/models/gemini-2-5-flash-image`）的精确描述，以及与代码对接所需的文件名、规格与放置路径。放置目录：`src/assets/{images,audio,fonts}`。

——

一、图片 Images（PNG 首选，背景可 JPG）

1) 主菜单背景 `images/bg_office.png`
- 画面：温暖色调的像素律所办公室，整体明亮不恐怖，氛围带一丝探案悬疑但可爱。
- 主要元素（需明确布局以适配热区）：
  - 左侧墙面上方：公告板（pin board，有便签/线连照片的侦探板）
  - 右侧：高书架（成排法条、档案盒、奖杯/徽章）
  - 中下部：摆满卷宗与印章的木质大桌
  - 左下角或左侧：半开的木门（门牌写“事务所”）
  - 中景：戴小侦探帽的小女孩（8bit/16bit 像素风），忙碌寻找线索的两帧循环小动画（可单独出 sprite，见 4)）
- 光照：柔和室内光源；色系：海军蓝、暖木色、薄荷绿点缀；避免阴森或惊悚元素。
- 构图：1280×720，中心留出标题安全区，四处留白以容纳热区。

2) 做题便签纸 `images/paper_note.png`
- 画面：浅米色或淡黄色便签纸，略有纹理与折角，四角有小圆钉或纸夹像素装饰。
- 尺寸：约 900×300（横向），透明背景 PNG。
- 中央文字区域保持高对比度（便签纸应比文字颜色更浅）。

3) 印章按钮 `images/stamp_true.png` / `images/stamp_false.png`
- 风格：像素化木制圆章俯视图；“真相”章为薄荷绿/青色系；“伪证”章为珊瑚红系。
- 尺寸：建议 160×160；PNG 透明。
- 要求：边缘清晰、轻阴影，点击有压下质感（可通过缩放实现）。

4) 小女孩侦探角色 sprite（可选增强）
- 文件：`images/detective_girl_idle.png`
- 2–4 帧轻动画：左手拿放大镜，右手翻卷宗或点头思考；循环帧数少，Q 版可爱。
- 尺寸：单帧建议 96×96，整图横排合图，并配 `images/detective_girl_idle.json`（可选）或在代码内用帧宽切割。

5) 道具图标 `images/icons_magnify.png` `images/icons_watch.png` `images/icons_light.png`
- 图标：放大镜、怀表/计时器、灯泡道具；像素卡通，线条干净。
- 尺寸：64×64 或 96×96，PNG 透明。
- 视觉：与便签纸和主色系协调，悬停/禁用可通过透明度实现。

——

二、音乐 Music（BGM）

1) 主菜单与一般关卡 BGM `audio/bgm_loop.ogg`
- 情绪：不恐怖、轻悬疑+可爱，温暖、律所日常、久听不腻。
- 配器建议：马林巴/木琴+柔和弦乐铺底+轻打击；速度 90–110 BPM；无突兀乐器。
- 结构：可平滑无缝循环（建议首尾可 crossfade），时长 ≥ 60s。
- 音量：导出整体 -12dB；建议 44.1kHz / 192kbps MP3。

——

三、音效 SFX（可爱俏皮）

- `audio/sfx_click.mp3`：UI 轻点击，软木头或小木槌感。
- `audio/sfx_stamp.mp3`：印章“咚”落桌面，短促带空气感。
- `audio/sfx_wrong.mp3`：错误提示，短促不上头，避免刺耳蜂鸣。
- `audio/sfx_success.mp3`：正确提示，柔和上扬音阶，时长 < 400ms。
- `audio/sfx_combo.mp3`：连击奖励，三连上扬晶莹音粒。

——

四、字体 Fonts（文件名与用途）

- `fonts/ui_sans_cn.ttf`：中文 UI 正文字体（建议：思源黑体或 HarmonyOS Sans 字重 Regular/Medium）。
- `fonts/mono_numbers.ttf`：等宽数字/运算题体（建议：JetBrains Mono 或 Fira Mono）。

加载说明：当前代码默认使用浏览器字体。若需强制统一视觉，可在 `index.html` 加 `@font-face` 或在 `PreloadScene` 引入自定义字体加载器；引入后将场景里的 `fontFamily` 改为对应字体名：`'ui_sans_cn'` 与 `'mono_numbers'`。

——

五、与代码对接（键名已预留）

- 预加载键（已在 `PreloadScene` 里注释预留）：
  - 图片：`bg_office` `paper_note` `stamp_true` `stamp_false` `icon_magnify` `icon_watch` `icon_flash`
  - 音频：`bgm_main` `sfx_click` `sfx_stamp` `sfx_wrong` `sfx_success`
- 使用位置：
  - 主菜单：若存在 `bg_office`，自动启用沉浸式热区（桌子=开始；公告板=手册；书架=荣誉墙；门=切换用户）。
  - 做题界面：若存在 `paper_note`，题干将绘制在便签纸上；若存在 `stamp_*`，真/伪按钮使用印章图；若存在 `icon_*`，道具改用图标显示。
  - 音频：`AudioManager` 已监听 `audio:play`，并在主菜单尝试 `bgm_main` 循环。

——

六、命名与导出规范

- 命名：全小写+下划线；PNG 带透明，JPG 仅用于大背景；音频主用 MP3，可加 OGG 备用。
- 画布：像素风避免过度插值；推荐在导出时保持清晰边缘。

——

七、投放步骤

1) 将图片/音频/字体拷贝至 `src/assets/{images,audio,fonts}`
2) 取消 `PreloadScene` 中对应 `this.load.image/audio` 的注释以启用预加载（或使用 Vite 静态路径也可）。
3) 运行后检查主菜单是否进入沉浸式模式、做题界面是否启用便签纸与图标；音频是否可播放。
