/**
 * 游戏资源配置文件
 * 定义资源加载的优先级和分组
 */

export interface AssetGroup {
  /** 资源名称 */
  name: string
  /** 资源文件路径 */
  path: string
  /** 资源类型 */
  type: 'image' | 'audio'
  /** 是否为核心资源（必须在加载完成前加载） */
  essential?: boolean
}

/** 资源配置分组 */
export const AssetConfig = {
  /** 核心图片资源 - 必须在游戏开始前加载完成 */
  coreImages: [
    { name: 'bg_office', path: 'images/bg_office.jpg', type: 'image' as const, essential: true },
    { name: 'bg_desk', path: 'images/bg_desk.jpg', type: 'image' as const, essential: true },
    { name: 'paper_note', path: 'images/paper_note.webp', type: 'image' as const, essential: true },
    { name: 'stamp_true', path: 'images/stamp_true.webp', type: 'image' as const, essential: true },
    { name: 'stamp_false', path: 'images/stamp_false.webp', type: 'image' as const, essential: true },
    { name: 'icons_magnify', path: 'images/icons_magnify.png', type: 'image' as const, essential: true },
    { name: 'icons_watch', path: 'images/icons_watch.png', type: 'image' as const, essential: true },
    { name: 'icons_light', path: 'images/icons_light.png', type: 'image' as const, essential: true },
  ],

  /** 主菜单背景音乐 - 优先级最高 */
  mainMenuBGM: [
    { name: 'bgm_main', path: 'audio/bgm_main.ogg', type: 'audio' as const, essential: false },
  ],

  /** 游戏背景音乐 - 次优先级 */
  gameBGM: [
    { name: 'bgm_game', path: 'audio/bgm_game.ogg', type: 'audio' as const, essential: false },
  ],

  /** 音效资源 - 游戏过程中按需加载 */
  sfx: [
    { name: 'sfx_click', path: 'audio/sfx_click.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_stamp', path: 'audio/sfx_stamp.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_wrong', path: 'audio/sfx_wrong.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_success', path: 'audio/sfx_success.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_lose_level', path: 'audio/sfx_lose_level.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_win_level', path: 'audio/sfx_win_level.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_combo', path: 'audio/sfx_combo.mp3', type: 'audio' as const, essential: false },
    { name: 'sfx_combo1', path: 'audio/sfx_combo1.mp3', type: 'audio' as const, essential: false },
  ],
}

/** 音频加载配置 */
export const AUDIO_LOADING_CONFIG = {
  /** BGM加载超时时间（毫秒） */
  bgmTimeout: 10000,
  /** 音效加载超时时间（毫秒） */
  sfxTimeout: 5000,
  /** BGM默认音量 */
  defaultBgmVolume: 0.25,
  /** 音效默认音量 */
  defaultSfxVolume: 0.6,
}