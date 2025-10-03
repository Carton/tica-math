import Phaser from 'phaser'
import { on } from '@/game/managers/EventBus'

type SoundCache = Record<string, Phaser.Sound.BaseSound>

export class AudioManager {
  private static scene: Phaser.Scene | null = null
  private static sounds: SoundCache = {}
  private static currentBgmKey: string | null = null
  private static _sfxEnabled = true
  private static _bgmEnabled = true
  private static defaultBgmKey = 'bgm_main' // 记录默认BGM
  private static hasUserInteracted = false // 记录用户是否已交互
  private static pendingBgmKey: string | null = null // 待播放的BGM

  static init(scene: Phaser.Scene) {
    this.scene = scene

    // 监听通用播放事件（解耦场景层逻辑）
    on('audio:play', ({ key }) => {
      this.playSfx(key)
    })

    // 添加全局点击事件监听器来检测用户交互
    if (typeof window !== 'undefined') {
      const handleFirstInteraction = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true
          console.log('✅ 检测到用户交互，启用音频播放')

          // 如果有待播放的BGM，现在开始播放
          if (this.pendingBgmKey) {
            setTimeout(() => {
              this.playBgmNow(this.pendingBgmKey!, { loop: true, volume: 0.25 })
            }, 100)
          }

          // 移除事件监听器
          window.removeEventListener('click', handleFirstInteraction)
          window.removeEventListener('touchstart', handleFirstInteraction)
          window.removeEventListener('keydown', handleFirstInteraction)
        }
      }

      // 监听多种用户交互事件
      window.addEventListener('click', handleFirstInteraction, { once: true })
      window.addEventListener('touchstart', handleFirstInteraction, { once: true })
      window.addEventListener('keydown', handleFirstInteraction, { once: true })
    }
  }

  static preloadAssets(scene: Phaser.Scene) {
    // 注意：音效实际在PreloadScene中加载，这里保留用于未来可能的BGM预加载
    // 为避免重复加载和路径冲突，此方法暂时只处理BGM
    // 示例（放开即可启用）：
    // scene.load.audio('bgm_main', ['audio/bgm_main_loop.mp3'])
  }

  static tryStartBgm(key: string, config: Phaser.Types.Sound.SoundConfig = { loop: true, volume: 0.25 }) {
    if (!this.scene || !this._bgmEnabled) return

    this.pendingBgmKey = key
    const snd = this.getOrCreateSound(key)
    if (!snd) return
    if (this.currentBgmKey === key && snd.isPlaying) return

    // 如果用户还未交互，设置音频上下文但暂不播放
    if (!this.hasUserInteracted) {
      console.log('等待用户交互后播放背景音乐...')
      return
    }

    this.playBgmNow(key, config)
  }

  private static playBgmNow(key: string, config: Phaser.Types.Sound.SoundConfig) {
    const snd = this.getOrCreateSound(key)
    if (!snd) return

    // 停掉旧BGM
    if (this.currentBgmKey && this.sounds[this.currentBgmKey]?.isPlaying) {
      this.sounds[this.currentBgmKey].stop()
    }

    this.currentBgmKey = key
    snd.play(config)
    console.log(`🎵 播放背景音乐: ${key}`)
  }

  static stopBgm() {
    if (!this.scene || !this.currentBgmKey) return
    const snd = this.sounds[this.currentBgmKey]
    if (snd?.isPlaying) snd.stop()
    // 不清除currentBgmKey，这样重新开启时可以继续播放相同的BGM
  }

  // 音效开关
  static get sfxEnabled() { return this._sfxEnabled }
  static setSfxEnabled(enabled: boolean) {
    this._sfxEnabled = enabled
    // 如果关闭音效，立即停止正在播放的音效，但不影响BGM
    if (!enabled) {
      Object.entries(this.sounds).forEach(([key, snd]) => {
        // 只停止非BGM的声音（音效）
        if (snd?.isPlaying && key !== this.currentBgmKey) {
          snd.stop()
        }
      })
    }
  }

  // 背景音乐开关
  static get bgmEnabled() { return this._bgmEnabled }
  static setBgmEnabled(enabled: boolean) {
    this._bgmEnabled = enabled
    if (enabled) {
      // 如果开启BGM，使用当前BGM或默认BGM
      const bgmKey = this.currentBgmKey || this.defaultBgmKey
      this.tryStartBgm(bgmKey)
    } else {
      // 如果关闭BGM，停止当前播放
      this.stopBgm()
    }
  }

  // 切换音效开关
  static toggleSfx() {
    this.setSfxEnabled(!this._sfxEnabled)
    return this._sfxEnabled
  }

  // 切换BGM开关
  static toggleBgm() {
    this.setBgmEnabled(!this._bgmEnabled)
    return this._bgmEnabled
  }

  static playSfx(key: string, config: Phaser.Types.Sound.SoundConfig = { volume: 0.6 }) {
    if (!this.scene || !this._sfxEnabled) return

    // 第一次播放音效时，标记用户已交互
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true
      console.log('✅ 检测到用户交互，启用音频播放')

      // 如果有待播放的BGM，现在开始播放
      if (this.pendingBgmKey) {
        setTimeout(() => {
          this.playBgmNow(this.pendingBgmKey!, { loop: true, volume: 0.25 })
        }, 100) // 稍微延迟以确保音频上下文已就绪
      }
    }

    const snd = this.getOrCreateSound(key)
    if (!snd) return
    // 快速音效并行播放
    snd.play(config)
  }

  private static getOrCreateSound(key: string): Phaser.Sound.BaseSound | null {
    if (!this.scene) return null
    if (this.sounds[key]) return this.sounds[key]
    if (!this.scene.sound) return null
    // 如果未预加载，Phaser 会在首次 add 时尝试查找缓存；若不存在则返回空
    try {
      const existing = this.scene.sound.get(key)
      if (existing) {
        this.sounds[key] = existing
        return existing
      }
      const created = this.scene.sound.add(key)
      // 如果 key 未加载，这里可能抛错，捕获并返回 null
      this.sounds[key] = created
      return created
    } catch {
      return null
    }
  }
}


