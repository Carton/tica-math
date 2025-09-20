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
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Listen to resize events for UI adaptation
    resizeInterval: 100,
    expandParent: false
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
    gamepad: true,
    // Add keyboard shortcuts
    keyboard: {
      target: window
    }
  },
  // Enable DOM container for UI elements
  dom: {
    createContainer: true
  },
  // Physics configuration (disabled for this math game)
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  // Callbacks for game lifecycle events
  callbacks: {
    preBoot: (game: Phaser.Game) => {
      // Initialize game-wide registry values
      game.registry.set('audio:volume:music', 0.7)
      game.registry.set('audio:volume:sfx', 0.8)
      game.registry.set('audio:muted', false)
      game.registry.set('game:level', 1)
      game.registry.set('game:score', 0)
      game.registry.set('game:badges', [])

      // Load saved data from localStorage
      loadGameData(game)
    }
  }
}

// Helper function to load saved game data
function loadGameData(game: Phaser.Game) {
  try {
    const savedLevel = localStorage.getItem('math-game:level')
    const savedBadges = localStorage.getItem('math-game:badges')
    const savedVolume = localStorage.getItem('math-game:volume')

    if (savedLevel) {
      game.registry.set('game:level', parseInt(savedLevel))
    }

    if (savedBadges) {
      game.registry.set('game:badges', JSON.parse(savedBadges))
    }

    if (savedVolume) {
      const volume = JSON.parse(savedVolume)
      game.registry.set('audio:volume:music', volume.music || 0.7)
      game.registry.set('audio:volume:sfx', volume.sfx || 0.8)
      game.registry.set('audio:muted', volume.muted || false)
    }
  } catch (error) {
    console.warn('Failed to load saved game data:', error)
  }
}

export default new Phaser.Game(config)