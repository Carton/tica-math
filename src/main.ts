import Phaser from 'phaser'
import { getGameConfig } from './game/config/gameConfig'
import BootScene from './game/scenes/BootScene'
import PreloadScene from './game/scenes/PreloadScene'
import MainMenuScene from './game/scenes/MainMenuScene'
import GameScene from './game/scenes/GameScene'
import UIScene from './game/scenes/UIScene'
import ResultScene from './game/scenes/ResultScene'

const config: Phaser.Types.Core.GameConfig = getGameConfig({
  parent: 'game',
  scenes: [BootScene, PreloadScene, MainMenuScene, GameScene, UIScene, ResultScene],
})

// eslint-disable-next-line no-new
new Phaser.Game(config)
