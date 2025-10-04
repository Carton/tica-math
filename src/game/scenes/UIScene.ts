import Phaser from 'phaser'
import { on, off, emit } from '@/game/managers/EventBus'
import { ToolManager, type ToolType } from '@/game/managers/ToolManager'
import { SaveManager } from '@/game/managers/SaveManager'
import { AudioManager } from '@/game/managers/AudioManager'
import { Strings } from '@/game/managers/Strings'
import { getUiConfig } from '@/game/config/uiConfig'
import { createTextButton } from '@/game/utils/uiFactory'

export default class UIScene extends Phaser.Scene {
  private headerLeftText?: Phaser.GameObjects.Text
  private countdownText?: Phaser.GameObjects.Text
  private hintText?: Phaser.GameObjects.Text
  private headerToolIcons: {
    magnify?: Phaser.GameObjects.Image
    watch?: Phaser.GameObjects.Image
    light?: Phaser.GameObjects.Image
  } = {}
  private headerToolTexts: {
    magnify?: Phaser.GameObjects.Text
    watch?: Phaser.GameObjects.Text
    light?: Phaser.GameObjects.Text
  } = {}
  private footerHintText?: Phaser.GameObjects.Text
  private toolUpdateHandler?: () => void
  private pauseButton?: Phaser.GameObjects.Text
  private remainingMs = 0
  private timer?: Phaser.Time.TimerEvent
  private pausedOverlay?: Phaser.GameObjects.Rectangle
  private pausedDialog?: Phaser.GameObjects.Container
  private isPaused = false
  private currentLevel = 1
  private userId = ''
  private clueIndex = 0
  private clueTotal = 0
  private toolsContainer?: Phaser.GameObjects.Container
  private toolIcons: {
    magnify?: Phaser.GameObjects.Image
    watch?: Phaser.GameObjects.Image
    light?: Phaser.GameObjects.Image
  } = {}
  private countdownStartHandler = ({ totalMs }: { totalMs: number }) => this.startCountdown(totalMs)
  private countdownExtendHandler = ({ deltaMs }: { deltaMs: number }) => this.extendCountdown(deltaMs)
  private hintHandler = ({ hint }: { hint: string }) => this.showHint(hint)

  private handleEscKey = () => this.togglePauseDialog()
  private handleTrueKey = () => this.emitChoice(true)
  private handleRightKey = () => this.emitChoice(true)
  private handleFalseKey = () => this.emitChoice(false)
  private handleLeftKey = () => this.emitChoice(false)

  constructor() {
    super('UIScene')
  }

  init(data: { level?: number } = {}) {
    if (data.level) this.currentLevel = data.level
  }

  create() {
    const { width, height } = this.scale

    // 获取右上角区域配置
    const headerAreaCfg = getUiConfig('headerArea')
    const { layout, textStyles, tools } = headerAreaCfg

    // 计算右上角元素位置
    const headerY = layout.baseY
    const pauseButtonX = width - layout.pauseButtonMarginRight
    const pauseButtonY = layout.pauseButtonMarginTop
    const countdownX = pauseButtonX - layout.countdownSpacing
    const toolDisplayX = countdownX - layout.toolDisplaySpacing

    const pauseCfg = getUiConfig('pauseButton')
    this.pauseButton = this.add.text(pauseButtonX, pauseButtonY, '⏸', {
      fontFamily: 'sans-serif',
      fontSize: `${pauseCfg.fontSize}px`,
      color: pauseCfg.textColor,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })

    this.pauseButton.on('pointerup', this.handleEscKey)

    this.userId = SaveManager.getCurrentUserId() || ''
    this.clueIndex = 0
    this.clueTotal = 10
    this.headerLeftText = this.add.text(40, headerY, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5)
    this.updateHeaderLeftText()

    this.countdownText = this.add.text(countdownX, headerY, '00:00', {
      fontFamily: 'sans-serif',
      fontSize: textStyles.countdownFontSize,
      color: textStyles.countdownColor,
    }).setOrigin(1, 0.5)

    const hintAreaWidth = width * 0.36
    this.hintText = this.add.text(width / 2, headerY, '', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#a9ffea',
      align: 'center',
      wordWrap: { width: hintAreaWidth },
    }).setOrigin(0.5, 0.5)

    // 使用新的右上角道具配置
    const addToolPair = (type: keyof typeof this.headerToolIcons, textureKey: string, index: number) => {
      const iconX = toolDisplayX + index * tools.spacing
      const icon = this.add.image(iconX, headerY, textureKey)
        .setDisplaySize(tools.iconSize, tools.iconSize)
        .setOrigin(0, 0.5)
      this.headerToolIcons[type] = icon

      const label = this.add.text(iconX + tools.iconSize + tools.iconLabelGap, headerY, 'x0', {
        fontFamily: 'sans-serif',
        fontSize: textStyles.toolCountFontSize,
        color: textStyles.toolCountColor,
      }).setOrigin(0, 0.5)
      this.headerToolTexts[type] = label
    }

    addToolPair('magnify', 'icons_magnify', 0)
    addToolPair('watch', 'icons_watch', 1)
    addToolPair('light', 'icons_light', 2)

    this.footerHintText = this.add.text(40, height - 140, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: width - 300 },
    })

    // 使用印章精灵（若资源存在），否则使用文字按钮
    let btnTrue: Phaser.GameObjects.GameObject
    let btnFalse: Phaser.GameObjects.GameObject
    if (this.textures.exists('stamp_true') && this.textures.exists('stamp_false')) {
      const sTrue = this.add.image(width / 2 - 120, height - 80, 'stamp_true').setOrigin(0.5).setInteractive({ useHandCursor: true })
      const sFalse = this.add.image(width / 2 + 120, height - 80, 'stamp_false').setOrigin(0.5).setInteractive({ useHandCursor: true })

      // 缩放印章到160x160像素
      sTrue.setDisplaySize(160, 160)
      sFalse.setDisplaySize(160, 160)

      btnTrue = sTrue
      btnFalse = sFalse
    } else {
      const tTrue = createTextButton(this, width / 2 - 140, height - 90, {
        text: Strings.t('user.truth_button'),
        configKey: 'primaryButton',
        backgroundColor: '#2de1c2',
      })
      const tFalse = createTextButton(this, width / 2 + 140, height - 90, {
        text: Strings.t('user.false_button'),
        configKey: 'primaryButton',
        backgroundColor: '#ff6b6b',
      })
      btnTrue = tTrue
      btnFalse = tFalse
    }

    ;(btnTrue as any).on('pointerup', () => this.emitChoice(true))
    ;(btnFalse as any).on('pointerup', () => this.emitChoice(false))

    this.input.keyboard?.on('keydown-T', this.handleTrueKey)
    this.input.keyboard?.on('keydown-RIGHT', this.handleRightKey)
    this.input.keyboard?.on('keydown-F', this.handleFalseKey)
    this.input.keyboard?.on('keydown-LEFT', this.handleLeftKey)

    // 创建道具图标容器
    this.createToolIcons()

    // 更新道具显示
    this.updateToolDisplay()
    this.toolUpdateHandler = () => this.updateToolDisplay()
    on('tool:update', this.toolUpdateHandler)

    on('progress:update', this.progressHandler)

    on('ui:countdown:start', this.countdownStartHandler)
    on('ui:countdown:extend', this.countdownExtendHandler)
    on('tool:hints', this.hintHandler)

    // ESC 暂停弹窗
    this.input.keyboard?.on('keydown-ESC', this.handleEscKey)

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('progress:update', this.progressHandler)
      off('ui:countdown:start', this.countdownStartHandler)
      off('ui:countdown:extend', this.countdownExtendHandler)
      off('tool:hints', this.hintHandler)
      if (this.toolUpdateHandler) {
        off('tool:update', this.toolUpdateHandler)
        this.toolUpdateHandler = undefined
      }
      const keyboard = this.input.keyboard
      keyboard?.off('keydown-ESC', this.handleEscKey)
      keyboard?.off('keydown-T', this.handleTrueKey)
      keyboard?.off('keydown-RIGHT', this.handleRightKey)
      keyboard?.off('keydown-F', this.handleFalseKey)
      keyboard?.off('keydown-LEFT', this.handleLeftKey)
      this.closePauseDialog(false)
      this.timer?.remove()
      this.timer = undefined
    })
  }

  private emitChoice(choice: boolean) {
    if (this.isPaused) return
    emit('ui:choice', { choice })
  }

  private closePauseDialog(emitResume: boolean) {
    if (!this.isPaused) return
    this.isPaused = false
    this.pausedOverlay?.destroy()
    this.pausedOverlay = undefined
    this.pausedDialog?.destroy()
    this.pausedDialog = undefined
    if (emitResume) emit('ui:resume', undefined as any)
  }

  private togglePauseDialog() {
    if (this.isPaused) {
      // 恢复
      this.closePauseDialog(true)
      return
    }
    // 暂停
    this.isPaused = true
    emit('ui:pause', undefined as any)

    const { width, height } = this.scale
    this.pausedOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0)
    this.pausedDialog = this.add.container(width / 2, height / 2)

    const bg = this.add.rectangle(0, 0, 420, 280, 0x1e2746, 0.95).setOrigin(0.5)
    const txt = this.add.text(0, -80, Strings.t('user.pause'), { fontFamily: 'sans-serif', fontSize: '26px', color: '#ffffff' }).setOrigin(0.5)

    // 音效开关按钮
    const btnSfx = createTextButton(this, -90, -30, {
      text: Strings.t('user.sfx_on'),
      configKey: 'secondaryButton',
      fontSize: 20,
    })

    // BGM开关按钮
    const btnBgm = createTextButton(this, 90, -30, {
      text: Strings.t('user.bgm_on'),
      configKey: 'secondaryButton',
      fontSize: 20,
    })

    // 主按钮 - 继续游戏
    const btnResume = createTextButton(this, 0, 40, {
      text: Strings.t('user.resume_game'),
      configKey: 'primaryButton',
    })

    // 主按钮 - 返回事务所
    const btnBack = createTextButton(this, 0, 110, {
      text: Strings.t('ui.back_to_agency'),
      configKey: 'primaryButton',
    })

    // 更新开关按钮文本
    const updateButtonTexts = () => {
      const sfxEnabled = AudioManager.sfxEnabled
      const bgmEnabled = AudioManager.bgmEnabled
      btnSfx.setText(sfxEnabled ? Strings.t('user.sfx_on') : Strings.t('user.sfx_off'))
      btnBgm.setText(bgmEnabled ? Strings.t('user.bgm_on') : Strings.t('user.bgm_off'))

      // 更新按钮颜色
      btnSfx.setBackgroundColor(sfxEnabled ? '#a9ffea' : '#ff6b6b')
      btnBgm.setBackgroundColor(bgmEnabled ? '#a9ffea' : '#ff6b6b')
    }

    // 初始更新
    updateButtonTexts()

    // 事件处理
    btnSfx.on('pointerup', () => {
      AudioManager.toggleSfx()
      updateButtonTexts()
    })

    btnBgm.on('pointerup', () => {
      AudioManager.toggleBgm()
      updateButtonTexts()
    })

    btnResume.on('pointerup', () => this.togglePauseDialog())

    btnBack.on('pointerup', () => {
      this.closePauseDialog(false)
      this.scene.stop('UIScene')
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })

    this.pausedDialog.add([bg, txt, btnSfx, btnBgm, btnResume, btnBack])
  }

  private startCountdown(totalMs: number) {
    this.timer?.remove()
    this.remainingMs = totalMs
    this.updateCountdownText()
    this.timer = this.time.addEvent({ delay: 100, loop: true, callback: () => {
      if (this.isPaused) return
      this.remainingMs -= 100
      if (this.remainingMs <= 0) {
        this.remainingMs = 0
        this.updateCountdownText()
        this.timer?.remove()
        emit('question:timeout', undefined as any)
      } else {
        this.updateCountdownText()
      }
    }})
  }

  private extendCountdown(deltaMs: number) {
    if (this.isPaused) return
    this.remainingMs += deltaMs
    this.updateCountdownText()
  }

  private updateCountdownText() {
    const sec = Math.ceil(this.remainingMs / 1000)
    const s = sec % 60
    const m = Math.floor(sec / 60)
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
    this.countdownText?.setText(`${pad(m)}:${pad(s)}`)
  }

  private showHint(hint: string) {
    this.hintText?.setText(hint)
    this.footerHintText?.setText(hint)
  }

  private createToolIcons() {
    const { width, height } = this.scale
    const useIcons = this.textures.exists('icons_magnify') && this.textures.exists('icons_watch') && this.textures.exists('icons_light')
    const toolCfg = getUiConfig('toolDisplay')

    // 创建道具图标容器 - 位置在右下角
    this.toolsContainer = this.add.container(width - 300, height - 90)

    const iconSpacing = 24
    const iconSize = toolCfg.footerIconSize

    if (useIcons) {
      // 使用PNG图标
      this.toolIcons.magnify = this.add.image(0, 0, 'icons_magnify')
        .setDisplaySize(iconSize, iconSize)
        .setInteractive({ useHandCursor: true })

      this.toolIcons.watch = this.add.image(iconSize + iconSpacing, 0, 'icons_watch')
        .setDisplaySize(iconSize, iconSize)
        .setInteractive({ useHandCursor: true })

      this.toolIcons.light = this.add.image((iconSize + iconSpacing) * 2, 0, 'icons_light')
        .setDisplaySize(iconSize, iconSize)
        .setInteractive({ useHandCursor: true })
    } else {
      // 使用表情符号作为降级方案
      this.toolIcons.magnify = this.add.text(0, 0, '🔍', {
        fontFamily: 'sans-serif',
        fontSize: '64px',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      this.toolIcons.watch = this.add.text(iconSize + iconSpacing, 0, '⏱️', {
        fontFamily: 'sans-serif',
        fontSize: '64px',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })

      this.toolIcons.light = this.add.text((iconSize + iconSpacing) * 2, 0, '💡', {
        fontFamily: 'sans-serif',
        fontSize: '64px',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    }

    // 添加点击事件
    this.toolIcons.magnify.on('pointerup', () => this.useTool('magnify'))
    this.toolIcons.watch.on('pointerup', () => this.useTool('watch'))
    this.toolIcons.light.on('pointerup', () => this.useTool('light'))

    // 添加悬停效果
    Object.values(this.toolIcons).forEach(icon => {
      icon.on('pointerover', () => {
        icon.setAlpha(0.8)
      })
      icon.on('pointerout', () => {
        icon.setAlpha(1)
      })
    })

    this.toolsContainer.add([
      this.toolIcons.magnify,
      this.toolIcons.watch,
      this.toolIcons.light
    ])
  }

  private useTool(type: ToolType) {
    if (this.isPaused) return
    ToolManager.use(type)
  }

  private updateToolDisplay() {
    const counts = ToolManager.getCounts()

    this.headerToolTexts.magnify?.setText(`x${counts.magnify}`)
    this.headerToolTexts.watch?.setText(`x${counts.watch}`)
    this.headerToolTexts.light?.setText(`x${counts.light}`)

    this.updateIconState('magnify', counts.magnify)
    this.updateIconState('watch', counts.watch)
    this.updateIconState('light', counts.light)

    this.footerHintText?.setVisible(false)
  }

  private updateIconState(type: ToolType, count: number) {
    const icon = this.toolIcons[type]
    if (!icon) return

    if (count <= 0) {
      // 禁用状态
      icon.setAlpha(0.3)
      icon.disableInteractive()
    } else {
      // 可用状态
      icon.setAlpha(1)
      icon.setInteractive({ useHandCursor: true })
    }
  }

  private progressHandler = () => {
    this.updateHeaderLeftText()
    this.updateToolDisplay()
  }

  private updateHeaderLeftText() {
    if (!this.headerLeftText) return
    const total = this.clueTotal > 0 ? this.clueTotal : 0
    const index = Math.max(0, this.clueIndex)
    const user = this.userId || '未知'
    const statusText = Strings.t('user.status_bar').replace('{0}', user).replace('{1}', this.currentLevel.toString()).replace('{2}', index.toString()).replace('{3}', total.toString())
    this.headerLeftText.setText(statusText)
  }
}
