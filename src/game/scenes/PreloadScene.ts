import Phaser from 'phaser'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { Strings } from '@/game/managers/Strings'
import { ToolManager } from '@/game/managers/ToolManager'
import { AudioManager } from '@/game/managers/AudioManager'
import { on } from '@/game/managers/EventBus'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.json('difficulty', 'game/config/digit-difficulty.json')
    this.load.json('strings', 'game/config/strings.zh-CN.json')
    // 音频与图片占位符可在此处预加载（文件到位后放开注释）
    this.load.image('bg_office', 'images/bg_office.png')
    this.load.image('bg_desk', 'images/bg_desk.png')
    this.load.image('paper_note', 'images/paper_note.webp')
    this.load.image('stamp_true', 'images/stamp_true.webp')
    this.load.image('stamp_false', 'images/stamp_false.webp')
    this.load.image('icons_magnify', 'images/icons_magnify.png')
    this.load.image('icons_watch', 'images/icons_watch.png')
    this.load.image('icons_light', 'images/icons_light.png')
    this.load.audio('bgm_main', ['audio/bgm_loop.ogg'])
    this.load.audio('sfx_click', ['audio/sfx_click.mp3'])
    this.load.audio('sfx_stamp', ['audio/sfx_stamp.mp3'])
    this.load.audio('sfx_wrong', ['audio/sfx_wrong.mp3'])
    this.load.audio('sfx_success', ['audio/sfx_success.mp3'])
    this.load.audio('sfx_lose_level', ['audio/sfx_lose_level.mp3'])
    this.load.audio('sfx_win_level', ['audio/sfx_win_level.mp3'])
    this.load.audio('sfx_combo', ['audio/sfx_combo.mp3'])
    this.load.audio('sfx_combo1', ['audio/sfx_combo1.mp3'])
  }

  create() {
    const diff = this.cache.json.get('difficulty')

    // 优先使用新的数位难度系统，如果不可用则回退到旧系统
    if (diff) {
      DifficultyManager.init(diff)
    }

    const lang = this.cache.json.get('strings')
    if (lang) Strings.init(lang)

    ToolManager.resetToDefault()

    // 初始化音频管理器（即使资源未就绪也不会报错）
    AudioManager.init(this)

    // 统一音频事件映射（不同事件使用不同音效键）
    on('ui:feedback', ({ type }) => {
      if (type === 'correct') AudioManager.playSfx('sfx_stamp') // 答题正确使用印章音效
      else if (type === 'wrong' || type === 'timeout') AudioManager.playSfx('sfx_wrong')
      else if (type === 'combo') AudioManager.playSfx('sfx_combo') // 连击音效
    })
    // 移除 ui:choice 事件的音效，因为答题音效已经由 ui:feedback 处理
    on('tool:use', () => AudioManager.playSfx('sfx_click'))

    this.scene.start('MainMenuScene')
  }
}
