import Phaser from 'phaser'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { Strings } from '@/game/managers/Strings'
import { ToolManager } from '@/game/managers/ToolManager'
import { AudioManager } from '@/game/managers/AudioManager'
import { LoadManager } from '@/game/managers/LoadManager'
import { on } from '@/game/managers/EventBus'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    console.log('🚀 开始加载核心资源...')

    // 加载配置文件
    this.load.json('difficulty', 'game/config/digit-difficulty.json')
    this.load.json('strings-zh', 'game/config/strings.zh-CN.json')
    this.load.json('strings-en', 'game/config/strings.en-US.json')

    // 加载核心图片资源 - 直接在Phaser中加载
    this.load.image('bg_office', 'images/bg_office.jpg')
    this.load.image('bg_desk', 'images/bg_desk.jpg')
    this.load.image('paper_note', 'images/paper_note.webp')
    this.load.image('stamp_true', 'images/stamp_true.webp')
    this.load.image('stamp_false', 'images/stamp_false.webp')
    this.load.image('icons_magnify', 'images/icons_magnify.png')
    this.load.image('icons_watch', 'images/icons_watch.png')
    this.load.image('icons_light', 'images/icons_light.png')

    // 加载音效资源 - 同步加载，文件较小
    this.load.audio('sfx_click', ['audio/sfx_click.mp3'])
    this.load.audio('sfx_stamp', ['audio/sfx_stamp.mp3'])
    this.load.audio('sfx_wrong', ['audio/sfx_wrong.mp3'])
    this.load.audio('sfx_success', ['audio/sfx_success.mp3'])
    this.load.audio('sfx_lose_level', ['audio/sfx_lose_level.mp3'])
    this.load.audio('sfx_win_level', ['audio/sfx_win_level.mp3'])
    this.load.audio('sfx_combo', ['audio/sfx_combo.mp3'])
    this.load.audio('sfx_combo1', ['audio/sfx_combo1.mp3'])

    // 设置加载事件监听器
    this.load.on('complete', () => {
      console.log('✅ 核心图片和音效资源加载完成')
    })

    this.load.on('loaderror', (file: any) => {
      console.error(`❌ 核心资源加载失败: ${file.key}`)
    })
  }

  create() {
    console.log('🎮 初始化游戏系统...')

    const diff = this.cache.json.get('difficulty')

    // 优先使用新的数位难度系统，如果不可用则回退到旧系统
    if (diff) {
      DifficultyManager.init(diff)
    }

    // 加载所有语言的字符串
    const zhStrings = this.cache.json.get('strings-zh')
    const enStrings = this.cache.json.get('strings-en')

    if (zhStrings) {
      Strings.init(zhStrings)
      // 加载英文字符串
      if (enStrings) {
        Strings.loadLanguage('en-US', enStrings)
      }
    } else {
      // 如果没有加载到中文，尝试加载旧格式的字符串
      const oldStrings = this.cache.json.get('strings')
      if (oldStrings) {
        Strings.init(oldStrings)
      }
    }

    ToolManager.resetToDefault()

    // 初始化音频管理器（音频资源将在后续场景中异步加载）
    AudioManager.init(this)

    // 将 Strings 类暴露到全局，供 HTML 调试面板使用
    ;(window as any).Strings = Strings

    // 统一音频事件映射（不同事件使用不同音效键）
    on('ui:feedback', ({ type }) => {
      if (type === 'correct') AudioManager.playSfx('sfx_stamp') // 答题正确使用印章音效
      else if (type === 'wrong' || type === 'timeout') AudioManager.playSfx('sfx_wrong')
      else if (type === 'combo') AudioManager.playSfx('sfx_combo') // 连击音效
    })
    // 移除 ui:choice 事件的音效，因为答题音效已经由 ui:feedback 处理
    on('tool:use', () => AudioManager.playSfx('sfx_click'))

    console.log('✅ 游戏系统初始化完成，进入主菜单')
    this.scene.start('MainMenuScene')
  }
}
