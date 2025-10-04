import Phaser from 'phaser'
import { AssetConfig, AUDIO_LOADING_CONFIG } from '@/game/config/assetConfig'
import { emit } from '@/game/managers/EventBus'

export class LoadManager {
  private static scene: Phaser.Scene | null = null
  private static loadedAssets = new Set<string>()
  private static loadingAssets = new Map<string, Promise<void>>()
  private static bgmLoadPromises = new Map<string, Promise<void>>()

  /**
   * 初始化加载管理器
   */
  static init(scene: Phaser.Scene) {
    this.scene = scene
  }

  /**
   * 加载核心图片资源（同步）
   */
  static loadCoreImages(): Promise<void> {
    if (!this.scene) throw new Error('LoadManager not initialized')

    const totalAssets = AssetConfig.coreImages.filter(asset => asset.type === 'image').length
    let loadedCount = 0

    return new Promise((resolve, reject) => {
      // 如果没有需要加载的图片，直接完成
      if (totalAssets === 0) {
        resolve()
        return
      }

      // 监听单个文件加载完成
      this.scene!.load.on('filecomplete', (key: string) => {
        loadedCount++
        this.loadedAssets.add(key)

        // 发送加载进度事件（虽然不显示进度条，但保留事件）
        emit('load:progress', {
          progress: (loadedCount / totalAssets) * 100,
          current: key,
          loaded: loadedCount,
          total: totalAssets
        })

        // 如果所有图片都加载完成
        if (loadedCount >= totalAssets) {
          console.log('✅ 核心图片资源加载完成')
          resolve()
        }
      })

      // 监听所有文件加载完成
      this.scene!.load.on('complete', () => {
        console.log('✅ 核心图片资源加载完成')
        resolve()
      })

      // 监听加载错误
      this.scene!.load.on('loaderror', (file: any) => {
        console.error(`❌ 加载失败: ${file.key}`)
        reject(new Error(`Failed to load: ${file.key}`))
      })

      // 开始加载所有核心图片
      AssetConfig.coreImages.forEach(asset => {
        if (asset.type === 'image') {
          this.scene!.load.image(asset.name, asset.path)
        }
      })

      // 启动加载
      this.scene!.load.start()
    })
  }

  /**
   * 异步加载音频资源
   */
  static async loadAudioAsync(audioKeys: string[], timeout = AUDIO_LOADING_CONFIG.bgmTimeout): Promise<void> {
    if (!this.scene) throw new Error('LoadManager not initialized')

    const promises = audioKeys.map(key => this.loadSingleAudio(key, timeout))
    await Promise.allSettled(promises)
  }

  /**
   * 加载单个音频文件
   */
  private static loadSingleAudio(key: string, timeout: number): Promise<void> {
    // 如果已经在加载中，返回现有的Promise
    if (this.loadingAssets.has(key)) {
      return this.loadingAssets.get(key)!
    }

    // 如果已经加载完成，直接返回
    if (this.loadedAssets.has(key)) {
      return Promise.resolve()
    }

    const promise = new Promise<void>((resolve, reject) => {
      if (!this.scene || !this.scene.sound) {
        reject(new Error('Scene or sound manager not available'))
        return
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        console.warn(`⚠️ 音频加载超时: ${key}`)
        reject(new Error(`Audio loading timeout: ${key}`))
      }, timeout)

      // 尝试获取已加载的音频
      try {
        const existingSound = this.scene.sound.get(key)
        if (existingSound) {
          clearTimeout(timeoutId)
          this.loadedAssets.add(key)
          resolve()
          return
        }
      } catch (error) {
        // 音频可能还未加载，继续执行加载逻辑
      }

      // 创建临时加载器
      const tempScene = this.scene
      const tempLoader = new Phaser.Loader.LoaderPlugin(tempScene)

      tempLoader.once('complete', () => {
        clearTimeout(timeoutId)
        this.loadedAssets.add(key)
        console.log(`✅ 音频加载完成: ${key}`)
        emit('audio:loaded', { key })
        resolve()
      })

      tempLoader.once('loaderror', (file: any) => {
        clearTimeout(timeoutId)
        console.error(`❌ 音频加载失败: ${file.key}`)
        emit('audio:error', { key: file.key, error: file.error })
        reject(new Error(`Audio loading failed: ${file.key}`))
      })

      // 查找音频路径
      const asset = [...AssetConfig.mainMenuBGM, ...AssetConfig.gameBGM, ...AssetConfig.sfx]
        .find(a => a.name === key)

      if (!asset) {
        clearTimeout(timeoutId)
        reject(new Error(`Audio asset not found: ${key}`))
        return
      }

      tempLoader.audio(key, [asset.path])
      tempLoader.start()
    })

    // 缓存Promise
    this.loadingAssets.set(key, promise)

    // 清理完成后的Promise缓存
    promise.finally(() => {
      this.loadingAssets.delete(key)
    })

    return promise
  }

  /**
   * 检查音频是否已加载
   */
  static isAudioLoaded(key: string): boolean {
    return this.loadedAssets.has(key)
  }

  /**
   * 获取已加载的音频对象
   */
  static getAudio(key: string): Phaser.Sound.BaseSound | null {
    if (!this.scene || !this.isAudioLoaded(key)) {
      return null
    }

    try {
      return this.scene.sound.get(key)
    } catch (error) {
      console.error(`获取音频失败: ${key}`, error)
      return null
    }
  }

  /**
   * 预加载主菜单BGM
   */
  static preloadMainMenuBGM(): Promise<void> {
    const bgmKeys = AssetConfig.mainMenuBGM.map(asset => asset.name)
    return this.loadAudioAsync(bgmKeys, AUDIO_LOADING_CONFIG.bgmTimeout)
  }

  /**
   * 预加载游戏BGM（在主菜单BGM加载完成后）
   */
  static async preloadGameBGM(): Promise<void> {
    const bgmKeys = AssetConfig.gameBGM.map(asset => asset.name)

    // 在主菜单BGM加载完成后，开始加载游戏BGM
    try {
      // 直接加载游戏BGM，不重新加载主菜单BGM
      console.log('🎵 开始预加载游戏BGM...')
      await this.loadAudioAsync(bgmKeys, AUDIO_LOADING_CONFIG.bgmTimeout)
      console.log('✅ 游戏BGM预加载完成')
    } catch (error) {
      console.warn('⚠️ 游戏BGM预加载失败，将在游戏场景中重试:', error)
    }
  }

  /**
   * 预加载音效（游戏过程中按需加载）
   */
  static async preloadSFX(): Promise<void> {
    const sfxKeys = AssetConfig.sfx.map(asset => asset.name)
    return this.loadAudioAsync(sfxKeys, AUDIO_LOADING_CONFIG.sfxTimeout)
  }

  /**
   * 获取加载状态信息
   */
  static getLoadStatus() {
    return {
      loadedAssets: Array.from(this.loadedAssets),
      loadingAssets: Array.from(this.loadingAssets.keys()),
      totalCoreImages: AssetConfig.coreImages.length,
      totalAudio: AssetConfig.mainMenuBGM.length + AssetConfig.gameBGM.length + AssetConfig.sfx.length
    }
  }
}