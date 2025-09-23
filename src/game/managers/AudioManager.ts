import Phaser from 'phaser'
import { on } from '@/game/managers/EventBus'

type SoundCache = Record<string, Phaser.Sound.BaseSound>

export class AudioManager {
  private static scene: Phaser.Scene | null = null
  private static sounds: SoundCache = {}
  private static currentBgmKey: string | null = null

  static init(scene: Phaser.Scene) {
    this.scene = scene

    // 监听通用播放事件（解耦场景层逻辑）
    on('audio:play', ({ key }) => {
      this.playSfx(key)
    })
  }

  static preloadAssets(scene: Phaser.Scene) {
    // 注意：仅当资源已放入 publicDir (`src/assets`) 后才会成功加载
    // 为避免 404，在资源到位之前不强制预加载。此方法保留给未来启用。
    // 示例（放开即可启用）：
    // scene.load.audio('bgm_main', ['assets/audio/bgm_main_loop.mp3'])
    // scene.load.audio('sfx_click', ['assets/audio/sfx_click.mp3'])
    // scene.load.audio('sfx_correct', ['assets/audio/sfx_correct.mp3'])
    // scene.load.audio('sfx_wrong', ['assets/audio/sfx_wrong.mp3'])
    // scene.load.audio('sfx_stamp', ['assets/audio/sfx_stamp.mp3'])
  }

  static tryStartBgm(key: string, config: Phaser.Types.Sound.SoundConfig = { loop: true, volume: 0.25 }) {
    if (!this.scene) return
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
    this.currentBgmKey = null
  }

  static playSfx(key: string, config: Phaser.Types.Sound.SoundConfig = { volume: 0.6 }) {
    if (!this.scene) return
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


