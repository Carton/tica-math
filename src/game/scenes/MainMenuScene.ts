import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { AudioManager } from '@/game/managers/AudioManager'
import { LoadManager } from '@/game/managers/LoadManager'
import { Strings } from '@/game/managers/Strings'
import type { LanguageCode } from '@/game/managers/Strings'
import { createTextButton } from '@/game/utils/uiFactory'
import { on, off } from '@/game/managers/EventBus'

export default class MainMenuScene extends Phaser.Scene {
  private bgmStatusText?: Phaser.GameObjects.Text
  private bgmLoadingIndicator?: Phaser.GameObjects.Container
  private bgmLoadStarted = false  // 防止重复初始化BGM加载

  constructor() {
    super('MainMenuScene')
  }

  create() {
    const { width, height } = this.scale

    // 检查是否有用户，如果没有则跳转到用户创建界面
    const users = SaveManager.getAllUsers()
    if (users.length === 0) {
      this.scene.start('UserScene')
      return
    }

    // 初始化LoadManager并开始异步加载BGM
    LoadManager.init(this)

    // 只有第一次启动时才加载BGM，避免从其他场景返回时重复加载
    if (!this.bgmLoadStarted) {
      this.startBGMLoading()
      this.bgmLoadStarted = true
    }

    // 创建BGM加载状态指示器（右下角）
    this.createBGMStatusIndicator(width, height)

    // 尝试渲染像素律所背景（若资源存在）
    let titleY = height / 2 - 80
    try {
      const hasBg = this.textures.exists('bg_office')
      if (hasBg) {
        const bg = this.add.image(width / 2, height / 2, 'bg_office')
        bg.setOrigin(0.5).setDepth(-10)
        bg.setDisplaySize(1280, 720)
        // 沉浸式：隐藏显式按钮，使用热区
        titleY = 80
      }
    } catch {}

    const title = this.add.text(width / 2, titleY, Strings.t('ui.title'), {
      fontFamily: 'sans-serif',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const userId = SaveManager.getCurrentUserId()
    const user = SaveManager.getCurrent()
    this.add.text(width / 2, title.y + 40, `${Strings.t('ui.current_user')}: ${userId}  ${Strings.t('ui.highest_level')}: ${user.bestLevel}  ${Strings.t('ui.badges_count')}:${user.badges.length}`, { fontFamily: 'monospace', fontSize: '14px', color: '#a9ffea' }).setOrigin(0.5)

    // 如果有背景图，则创建沉浸式热区；否则显示文字按钮
    if (this.textures.exists('bg_office')) {
      const createHotspot = (
        xRatio: number,
        yRatio: number,
        widthRatio: number,
        heightRatio: number,
        labelText: string,
        onPointerUp: () => void,
        labelYOffsetRatio = 0
      ) => {
        const rect = this.add.rectangle(
          width * xRatio,
          height * yRatio,
          width * widthRatio,
          height * heightRatio,
          0xffffff,
          0
        )
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })

        const label = this.add.text(rect.x, rect.y + height * labelYOffsetRatio, labelText, {
          fontFamily: 'serif',
          fontSize: '24px',
          color: '#f8f0c8'
        })
          .setOrigin(0.5)
          .setAlpha(0)
          .setDepth(10)

        label.setStroke('#382b18', 2).setShadow(0, 2, '#050608', 6, false, true)

        const fadeLabel = (alpha: number, duration: number) => {
          this.tweens.killTweensOf(label)
          this.tweens.add({
            targets: label,
            alpha,
            duration,
            ease: 'Sine.easeOut'
          })
        }

        rect.on('pointerover', () => {
          rect.setFillStyle(0xffffff, 0.3)
          fadeLabel(1, 120)
        })

        rect.on('pointerout', () => {
          rect.setFillStyle(0x0, 0)
          fadeLabel(0, 160)
        })

        rect.on('pointerup', () => {
        onPointerUp()
        // 为不同的热点设置不同的音效
        if (labelText === Strings.t('ui.start_game')) {
          AudioManager.playSfx('sfx_stamp')
        } else {
          AudioManager.playSfx('sfx_click')
        }
      })

        return rect
      }

      createHotspot(0.41, 0.68, 0.35, 0.12, Strings.t('ui.start_game'), () => {
        const level = user.currentLevel || 1
        ToolManager.resetToDefault()
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      })

      createHotspot(0.255, 0.37, 0.05, 0.12, Strings.t('ui.switch_user'), () => this.scene.start('UserScene'))

      createHotspot(0.81, 0.48, 0.17, 0.37, Strings.t('ui.detective_manual'), () => this.scene.start('ManualScene'))

      createHotspot(0.71, 0.01, 0.38, 0.55, Strings.t('ui.honor_wall'), () => this.scene.start('HonorScene'), 0.17)

      // 语言切换按钮
      const createLanguageButton = () => {
        const currentLang = Strings.getLanguage()
        const nextLang = currentLang === 'zh-CN' ? Strings.t('ui.language_english') : Strings.t('ui.language_chinese')
        const langRect = this.add.rectangle(width - 80, 40, 120, 40, 0xffffff, 0.1)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(10)

        const langText = this.add.text(langRect.x, langRect.y, nextLang, {
          fontFamily: 'sans-serif',
          fontSize: '16px',
          color: '#f8f0c8'
        }).setOrigin(0.5).setDepth(11)

        langText.setStroke('#382b18', 2).setShadow(0, 2, '#050608', 4, false, true)

        langRect.on('pointerover', () => {
          langRect.setFillStyle(0xffffff, 0.3)
          this.tweens.add({
            targets: langText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            ease: 'Sine.easeOut'
          })
        })

        langRect.on('pointerout', () => {
          langRect.setFillStyle(0xffffff, 0.1)
          this.tweens.add({
            targets: langText,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Sine.easeOut'
          })
        })

        langRect.on('pointerup', () => {
          AudioManager.playSfx('sfx_click')
          // 切换语言
          const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN'
          Strings.setLanguage(newLang)
          // 重新加载场景以应用新语言
          this.scene.restart()
        })

        return { rect: langRect, text: langText }
      }

      createLanguageButton()
    } else {
      // 按钮模式 - 只有在背景无法加载时显示
      const startY = title.y + 120
      const spacing = 70

      const startBtn = createTextButton(this, width / 2, startY, {
        text: Strings.t('ui.start_game'),
        configKey: 'primaryButton',
      })

      const manualBtn = createTextButton(this, width / 2, startY + spacing, {
        text: Strings.t('ui.detective_manual'),
        configKey: 'secondaryButton',
      })

      const honorBtn = createTextButton(this, width / 2, startY + spacing * 2, {
        text: Strings.t('ui.honor_wall'),
        configKey: 'secondaryButton',
      })

      const manageBtn = createTextButton(this, width / 2, startY + spacing * 3, {
        text: Strings.t('ui.switch_user'),
        configKey: 'secondaryButton',
      })

      // 语言切换按钮
      const currentLang = Strings.getLanguage()
      const nextLang = currentLang === 'zh-CN' ? Strings.t('ui.language_english') : Strings.t('ui.language_chinese')
      const langBtn = createTextButton(this, width / 2, startY + spacing * 4, {
        text: nextLang,
        configKey: 'secondaryButton',
      })

      // 按钮事件处理
      startBtn.on('pointerup', () => {
        AudioManager.playSfx('sfx_stamp') // 开始游戏使用印章音效
        const level = user.currentLevel || 1
        ToolManager.resetToDefault()
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      })

      manualBtn.on('pointerup', () => {
        AudioManager.playSfx('sfx_click') // 其他按钮使用点击音效
        this.scene.start('ManualScene')
      })
      honorBtn.on('pointerup', () => {
        AudioManager.playSfx('sfx_click')
        this.scene.start('HonorScene')
      })
      manageBtn.on('pointerup', () => {
        AudioManager.playSfx('sfx_click')
        this.scene.start('UserScene')
      })

      langBtn.on('pointerup', () => {
        AudioManager.playSfx('sfx_click')
        // 切换语言
        const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN'
        Strings.setLanguage(newLang)
        // 重新加载场景以应用新语言
        this.scene.restart()
      })

      this.input.keyboard?.once('keydown-ENTER', () => startBtn.emit('pointerup'))
    }

    // 进入时尝试播放主菜单BGM（如果资源就绪）
    AudioManager.tryStartBgm('bgm_main')

    // 监听音频加载事件
    this.setupAudioEventListeners()
  }

  /**
   * 创建BGM加载状态指示器（右下角）
   */
  private createBGMStatusIndicator(width: number, height: number) {
    try {
      const container = this.add.container(width - 20, height - 40)

      this.bgmStatusText = this.add.text(0, 0, Strings.t('audio.bgm_loading'), {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#a9ffea'
      }).setOrigin(1, 0.5)

      const dots = this.add.text(-5, 0, '...', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#a9ffea'
      }).setOrigin(0, 0.5)

      this.tweens.add({
        targets: dots,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })

      container.add([this.bgmStatusText, dots])
      this.bgmLoadingIndicator = container

      // 设置初始状态为透明，避免显示问题
      container.setAlpha(0.8)
    } catch (error) {
      console.warn('BGM状态指示器创建失败:', error)
      // 如果创建失败，设置为null避免后续错误
      this.bgmStatusText = undefined
      this.bgmLoadingIndicator = undefined
    }
  }

  /**
   * 开始异步加载BGM
   */
  private async startBGMLoading() {
    console.log('🎵 开始加载主菜单BGM...')
    this.updateBGMStatus('loading')

    try {
      // 加载主菜单BGM
      await LoadManager.preloadMainMenuBGM()
      this.updateBGMStatus('ready')
      console.log('✅ 主菜单BGM加载完成')


      // 如果BGM开关开启，尝试播放
      if (AudioManager.bgmEnabled) {
        AudioManager.tryStartBgm('bgm_main')
      }

    } catch (error) {
      console.warn('⚠️ 主菜单BGM加载失败:', error)
      this.updateBGMStatus('failed')
    }
  }

  /**
   * 在后台预加载游戏BGM
   */
  private async preloadGameBGMInBackground() {
    try {
      console.log('🎵 开始预加载游戏BGM...')
      await LoadManager.preloadGameBGM()
      console.log('✅ 游戏BGM预加载完成')
    } catch (error) {
      console.warn('⚠️ 游戏BGM预加载失败:', error)
    }
  }

  /**
   * 设置音频事件监听器
   */
  private setupAudioEventListeners() {
    // 监听BGM加载完成
    const onAudioLoaded = ({ key }: { key: string }) => {
      // 只有主菜单BGM完成时才更新UI状态
      if (key === 'bgm_main') {
        this.updateBGMStatus('ready')
        console.log('✅ 主菜单BGM加载完成')
        // 主菜单BGM加载完成后，自动开始预加载游戏BGM
        this.preloadGameBGMInBackground()
      }
      // 游戏BGM完成时不显示UI状态，只记录日志
      else if (key === 'bgm_game') {
        console.log('✅ 游戏BGM预加载完成')
      }
    }

    // 监听BGM加载失败
    const onAudioError = ({ key }: { key: string }) => {
      // 只有主菜单BGM失败时才更新UI状态
      if (key === 'bgm_main') {
        this.updateBGMStatus('failed')
        console.warn('❌ 主菜单BGM加载失败')
      }
      // 游戏BGM失败时只记录日志
      else if (key === 'bgm_game') {
        console.warn('❌ 游戏BGM预加载失败')
      }
    }

    on('audio:loaded', onAudioLoaded)
    on('audio:error', onAudioError)

    // 在场景销毁时清理事件监听器
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      off('audio:loaded', onAudioLoaded)
      off('audio:error', onAudioError)
    })
  }

  /**
   * 更新BGM状态显示
   */
  private updateBGMStatus(status: 'loading' | 'ready' | 'failed') {
    try {
      if (!this.bgmStatusText || !this.bgmLoadingIndicator) {
        console.log('BGM状态指示器未初始化，跳过状态更新')
        return
      }

      // 使用国际化字符串和设置颜色
      let textKey = ''
      let color = ''

      switch (status) {
        case 'loading':
          textKey = 'audio.bgm_loading'
          color = '#a9ffea' // 青色
          break
        case 'ready':
          textKey = 'audio.bgm_ready'
          color = '#4ade80' // 绿色
          break
        case 'failed':
          textKey = 'audio.bgm_failed'
          color = '#f87171' // 红色
          break
      }

      const text = Strings.t(textKey)
      this.bgmStatusText.setText(text)
      this.bgmStatusText.setColor(color)
      console.log(`BGM状态更新: ${text}`)

      // 加载完成或失败后3秒隐藏指示器
      if (status === 'ready' || status === 'failed') {
        this.time.delayedCall(3000, () => {
          if (this.bgmLoadingIndicator) {
            this.tweens.add({
              targets: this.bgmLoadingIndicator,
              alpha: 0,
              duration: 500,
              ease: 'Sine.easeOut',
              onComplete: () => {
                this.bgmLoadingIndicator?.setVisible(false)
              }
            })
          }
        })
      }
    } catch (error) {
      console.warn('更新BGM状态失败:', error)
    }
  }

  /**
   * 场景销毁时重置状态
   */
  shutdown() {
    // 重置BGM加载标志，允许重新进入时重新加载
    this.bgmLoadStarted = false
    console.log('MainMenuScene shutdown - BGM加载状态已重置')
  }
}
