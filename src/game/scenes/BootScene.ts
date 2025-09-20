export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    this.load.pack('preloader-pack', 'assets/preloader-pack.json')
  }

  create() {
    this.scene.start('PreloaderScene')
  }
}