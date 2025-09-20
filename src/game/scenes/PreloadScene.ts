import Phaser from 'phaser'
import { DifficultyManager } from '@/game/managers/DifficultyManager'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.json('difficulty', 'game/config/difficulty.json')
    this.load.json('strings', 'game/config/strings.zh-CN.json')
  }

  create() {
    const diff = this.cache.json.get('difficulty')
    if (diff) DifficultyManager.init(diff)
    this.scene.start('MainMenuScene')
  }
}
