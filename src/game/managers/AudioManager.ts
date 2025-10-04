import Phaser from 'phaser'
import { on } from '@/game/managers/EventBus'
import { LoadManager } from '@/game/managers/LoadManager'

type SoundCache = Record<string, Phaser.Sound.BaseSound>

export class AudioManager {
  private static scene: Phaser.Scene | null = null
  private static sounds: SoundCache = {}
  private static currentBgmKey: string | null = null
  private static pendingBgm: { key: string, config: Phaser.Types.Sound.SoundConfig } | null = null
  private static waitingForUnlock = false
  private static _sfxEnabled = true
  private static _bgmEnabled = true
  private static defaultBgmKey = 'bgm_main' // 记录默认BGM
  private static requestedBgmKey: string | null = null // 当前期望的BGM

  static init(scene: Phaser.Scene) {
    this.scene = scene

    // 监听通用播放事件（解耦场景层逻辑）
    on('audio:play', ({ key }) => {
      this.playSfx(key)
    })
  }

  static preloadAssets(scene: Phaser.Scene) {
    // 注意：音效实际在PreloadScene中加载，这里保留用于未来可能的BGM预加载
    // 为避免重复加载和路径冲突，此方法暂时只处理BGM
    // 示例（放开即可启用）：
    // scene.load.audio('bgm_main', ['audio/bgm_main_loop.mp3'])
  }

  static tryStartBgm(key: string, config: Phaser.Types.Sound.SoundConfig = { loop: true, volume: 0.25 }) {
    if (!this.scene || !this._bgmEnabled) return
    const soundManager = this.scene.sound
    if (!soundManager) return

    if (soundManager.locked) {
      this.pendingBgm = { key, config }
      if (!this.waitingForUnlock) {
        this.waitingForUnlock = true
        soundManager.once(Phaser.Sound.Events.UNLOCKED, () => {
          this.waitingForUnlock = false
          const pending = this.pendingBgm
          this.pendingBgm = null
          if (!pending || !this._bgmEnabled) return
          this.tryStartBgm(pending.key, pending.config)
        })
      }
      return
    }

    const snd = this.getOrCreateSound(key)
    if (!snd) return
    if (this.currentBgmKey === key && snd.isPlaying) return
    // 停掉旧BGM
    if (this.currentBgmKey && this.sounds[this.currentBgmKey]?.isPlaying) {
      this.sounds[this.currentBgmKey].stop()
    }
    this.currentBgmKey = key
    snd.play(config)
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

  /**
   * 请求播放指定的BGM
   * 场景调用来声明自己想要播放的BGM
   * 如果音频已加载，立即播放；如果未加载，等待加载完成事件
   */
  static requestBgm(key: string) {
    // 如果是相同的BGM请求，忽略重复请求
    if (this.requestedBgmKey === key) {
      return
    }

    this.requestedBgmKey = key
    console.log(`🎵 场景声明要播放BGM: ${key}`)

    if (!this._bgmEnabled) {
      console.log('🔇 BGM已关闭')
      this.requestedBgmKey = null
      return
    }

    // 检查是否已加载，使用LoadManager的加载状态
    if (LoadManager.isAudioLoaded(key)) {
      console.log(`✅ BGM已预加载，立即播放: ${key}`)
      this.tryStartBgm(key)
      this.requestedBgmKey = null
      return
    }

    // 备用检测：检查场景音频管理器
    if (this.scene && this.scene.sound) {
      try {
        const existingSound = this.scene.sound.get(key)
        if (existingSound) {
          console.log(`✅ BGM已在场景中，立即播放: ${key}`)
          this.tryStartBgm(key)
          this.requestedBgmKey = null
          return
        }
      } catch (error) {
        // BGM可能还未加载，继续等待逻辑
      }
    }

    // 如果未加载，等待LoadManager的audio:loaded事件触发播放
    console.log(`⏳ BGM尚未加载，等待加载完成: ${key}`)
  }

  static playSfx(key: string, config: Phaser.Types.Sound.SoundConfig = { volume: 0.6 }) {
    if (!this.scene || !this._sfxEnabled) return
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


