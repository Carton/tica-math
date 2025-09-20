import Phaser from 'phaser'
import { DifficultyManager } from '@/game/managers/DifficultyManager'
import { Strings } from '@/game/managers/Strings'
import { ToolManager } from '@/game/managers/ToolManager'

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

    const lang = this.cache.json.get('strings')
    if (lang) Strings.init(lang)

    ToolManager.reset(3)

    this.scene.start('MainMenuScene')
  }
}
