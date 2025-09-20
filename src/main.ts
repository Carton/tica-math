import Phaser from 'phaser'
import BootScene from '@/game/scenes/BootScene'
import PreloaderScene from '@/game/scenes/PreloaderScene'
import MainMenuScene from '@/game/scenes/MainMenuScene'
import GameScene from '@/game/scenes/GameScene'
import UIScene from '@/game/scenes/UIScene'
import LevelEndScene from '@/game/scenes/LevelEndScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#0f1320',
  width: 1280,
  height: 720,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene,
    PreloaderScene,
    MainMenuScene,
    GameScene,
    UIScene,
    LevelEndScene
  ],
  audio: {
    disableWebAudio: false
  },
  input: {
    gamepad: true
  }
}

export default new Phaser.Game(config)