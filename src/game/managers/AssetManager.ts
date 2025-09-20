import { AssetConfig, DEFAULT_ASSET_CONFIG, GameAssets } from '../config/AssetConfig'

export default class AssetManager {
  private scene: Phaser.Scene
  private config: AssetConfig
  private loadedAssets: Map<string, Phaser.GameObjects.Image | Phaser.GameObjects.Sprite> = new Map()
  private audioCache: Map<string, Phaser.Sound.BaseSound> = new Map()

  constructor(scene: Phaser.Scene, config: AssetConfig = DEFAULT_ASSET_CONFIG) {
    this.scene = scene
    this.config = config
  }

  // 预加载所有素材
  preload(): void {
    this.loadImages()
    this.loadAudio()
    this.loadSpritesheets()
  }

  private loadImages(): void {
    const { assets } = this.config

    // Background images
    this.scene.load.image('main-bg', assets.backgrounds.main)
    this.scene.load.image('question-note', assets.backgrounds.questionNote)
    this.scene.load.image('button-bg', assets.backgrounds.button)
    this.scene.load.image('pause-overlay', assets.backgrounds.pauseOverlay)

    // Character images
    Object.entries(assets.character.tica).forEach(([key, path]) => {
      this.scene.load.image(`tica-${key}`, path)
    })

    // UI elements
    Object.entries(assets.ui.buttons).forEach(([key, path]) => {
      this.scene.load.image(`btn-${key}`, path)
    })

    Object.entries(assets.ui.tools).forEach(([key, path]) => {
      this.scene.load.image(`tool-${key}`, path)
    })

    Object.entries(assets.ui.icons).forEach(([key, path]) => {
      this.scene.load.image(`icon-${key}`, path)
    })
  }

  private loadAudio(): void {
    const { assets } = this.config

    // Background music
    this.scene.load.audio('bg-music', assets.audio.background)

    // Sound effects
    Object.entries(assets.audio.effects).forEach(([key, path]) => {
      this.scene.load.audio(`sfx-${key}`, path)
    })
  }

  private loadSpritesheets(): void {
    const { assets } = this.config

    // Animation spritesheets
    Object.entries(assets.animations.feedback).forEach(([key, path]) => {
      this.scene.load.spritesheet(`feedback-${key}`, path, {
        frameWidth: 64,
        frameHeight: 64
      })
    })

    Object.entries(assets.animations.tools).forEach(([key, path]) => {
      this.scene.load.spritesheet(`tool-${key}`, path, {
        frameWidth: 128,
        frameHeight: 128
      })
    })
  }

  // 创建带素材的游戏对象
  createBackground(): Phaser.GameObjects.Image {
    const bg = this.scene.add.image(0, 0, 'main-bg')
    bg.setOrigin(0, 0)
    bg.setDisplaySize(this.scene.cameras.main.width, this.scene.cameras.main.height)
    return bg
  }

  createQuestionArea(x: number, y: number): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text } {
    const container = this.scene.add.container(x, y)

    // Note background
    const noteBg = this.scene.add.image(0, 0, 'question-note')
    noteBg.setDisplaySize(400, 200)

    // Question text
    const questionText = this.scene.add.text(0, 0, '等待题目...', {
      fontSize: '32px',
      color: '#333333',
      wordWrap: { width: 350 },
      fontWeight: 'bold'
    }).setOrigin(0.5)

    container.add([noteBg, questionText])

    return { container, text: questionText }
  }

  createButton(x: number, y: number, type: 'true' | 'false' | 'pause' | 'menu', onClick: () => void): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)

    const buttonImage = this.scene.add.image(0, 0, `btn-${type}Button`)
    buttonImage.setInteractive()

    // Add hover effects
    buttonImage.on('pointerover', () => {
      buttonImage.setTint(0xCCCCCC)
      this.scene.input.setDefaultCursor('pointer')
    })

    buttonImage.on('pointerout', () => {
      buttonImage.setTint(0xFFFFFF)
      this.scene.input.setDefaultCursor('default')
    })

    buttonImage.on('pointerdown', onClick)

    container.add(buttonImage)
    return container
  }

  createToolIcon(x: number, y: number, toolType: 'magnify' | 'timeSlow' | 'insight'): Phaser.GameObjects.Image {
    const icon = this.scene.add.image(x, y, `tool-${toolType}`)
    icon.setInteractive()
    icon.setDisplaySize(48, 48)
    return icon
  }

  createCharacter(x: number, y: number, state: 'idle' | 'thinking' | 'happy' | 'surprised' = 'idle'): Phaser.GameObjects.Sprite {
    const character = this.scene.add.sprite(x, y, `tica-${state}`)
    character.setDisplaySize(120, 120)
    return character
  }

  // 音频管理
  playBackgroundMusic(): void {
    const music = this.scene.sound.add('bg-music', {
      loop: true,
      volume: 0.3
    })
    music.play()
    this.audioCache.set('bg-music', music)
  }

  playSoundEffect(effectName: string): void {
    const soundKey = `sfx-${effectName}`
    if (!this.audioCache.has(soundKey)) {
      const sound = this.scene.sound.add(soundKey, { volume: 0.5 })
      this.audioCache.set(soundKey, sound)
    }

    const sound = this.audioCache.get(soundKey)
    if (sound) {
      sound.play()
    }
  }

  pauseBackgroundMusic(): void {
    const music = this.audioCache.get('bg-music')
    if (music) {
      music.pause()
    }
  }

  resumeBackgroundMusic(): void {
    const music = this.audioCache.get('bg-music')
    if (music) {
      music.resume()
    }
  }

  // 动画管理
  createAnimation(key: string, texture: string, frames: number, frameRate: number = 10, repeat: number = -1): void {
    const frameNames = []
    for (let i = 0; i < frames; i++) {
      frameNames.push({ key: texture, frame: i })
    }

    this.scene.anims.create({
      key,
      frames: frameNames,
      frameRate,
      repeat
    })
  }

  // 清理资源
  destroy(): void {
    this.loadedAssets.clear()
    this.audioCache.forEach(sound => sound.destroy())
    this.audioCache.clear()
  }

  // 获取素材配置
  getConfig(): AssetConfig {
    return this.config
  }

  // 更新配置（用于动态换肤等）
  updateConfig(newConfig: AssetConfig): void {
    this.config = newConfig
  }
}