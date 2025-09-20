import Phaser from 'phaser'

type GameConfigOptions = {
  parent: string
  scenes: Phaser.Types.Scenes.SettingsConfig[] | (new (...args: any[]) => Phaser.Scene)[]
}

export function getGameConfig(opts: GameConfigOptions): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: opts.parent,
    backgroundColor: '#0b1021',
    width: 1280,
    height: 720,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    render: {
      pixelArt: true,
      antialias: true,
    },
    scene: opts.scenes,
    fps: {
      target: 60,
      min: 30,
      forceSetTimeOut: true,
    },
  }
}
