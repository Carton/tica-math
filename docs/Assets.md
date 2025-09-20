### 资源清单与替换指南

本项目当前使用占位资源与 Emoji 图标。你可以将实际资源放在 `src/assets` 对应目录并替换加载路径。

- images/
  - bg_office_placeholder.png：背景（1280×720 或更大），JPG/PNG 皆可
  - paper_note_placeholder.png：题目便签纸（约 900×300）
  - stamp_true.png / stamp_false.png：印章风格（建议带透明通道 PNG）
  - icons_magnify.png / icons_watch.png / icons_flash.png：道具图标（64×64 或 96×96）
- audio/
  - bgm_loop_placeholder.mp3：循环 BGM（建议时长 ≥ 60s，-12dB）
  - sfx_click.mp3 / sfx_stamp.mp3 / sfx_wrong.mp3 / sfx_success.mp3 / sfx_combo.mp3
- fonts/
  - UI_Sans_Placeholder.ttf：UI 字体

建议教育字体：
- 思源黑体 / HarmonyOS Sans（中文 UI）
- Fira Mono / JetBrains Mono（题目等式对齐）

命名与格式：
- 使用小写+下划线命名；PNG 带透明，JPG 用于大背景；音频优先 mp3，必要时 ogg 备份。

替换步骤：
1. 将图片/音频/字体拷贝至 `src/assets/{images,audio,fonts}`
2. 在 `PreloadScene` 中添加对应 `this.load.image/audio/font`，并替换场景中的占位文本/Emoji。
3. 构建后确保资源被拷贝到 `dist`（Vite publicDir 已指向 `src/assets`）。
