import Phaser from 'phaser'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { Strings } from '@/game/managers/Strings'
import { ToolManager } from '@/game/managers/ToolManager'
import { AudioManager } from '@/game/managers/AudioManager'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.json('difficulty', 'game/config/difficulty.json')
    this.load.json('strings', 'game/config/strings.zh-CN.json')
    // 音频与图片占位符可在此处预加载（文件到位后放开注释）
    // this.load.image('bg_office', 'assets/images/bg_office_placeholder.png')
    // this.load.image('paper_note', 'assets/images/paper_note_placeholder.png')
    // this.load.image('stamp_true', 'assets/images/stamp_true.png')
    // this.load.image('stamp_false', 'assets/images/stamp_false.png')
    // this.load.image('icon_magnify', 'assets/images/icons_magnify.png')
    // this.load.image('icon_watch', 'assets/images/icons_watch.png')
    // this.load.image('icon_flash', 'assets/images/icons_flash.png')
    // this.load.audio('bgm_main', ['assets/audio/bgm_loop_placeholder.mp3'])
    // this.load.audio('sfx_click', ['assets/audio/sfx_click.mp3'])
    // this.load.audio('sfx_stamp', ['assets/audio/sfx_stamp.mp3'])
    // this.load.audio('sfx_wrong', ['assets/audio/sfx_wrong.mp3'])
    // this.load.audio('sfx_success', ['assets/audio/sfx_success.mp3'])
  }

  create() {
    const diff = this.cache.json.get('difficulty')
    if (diff) DifficultyManager.init(diff)

    const lang = this.cache.json.get('strings')
    if (lang) Strings.init(lang)

    ToolManager.resetToDefault()

    // 初始化音频管理器（即使资源未就绪也不会报错）
    AudioManager.init(this)

    this.scene.start('MainMenuScene')
  }
}
