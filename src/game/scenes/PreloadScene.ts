import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    // 占位：可在此加载图片/音频/字体资源
    // this.load.image('paper', 'images/paper_note_placeholder.png')
    // this.load.audio('sfx_stamp', 'audio/sfx_stamp.mp3')
  }

  create() {
    this.scene.start('MainMenuScene')
  }
}
