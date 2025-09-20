import Phaser from 'phaser'

export default class ManualScene extends Phaser.Scene {
  constructor() {
    super('ManualScene')
  }

  create() {
    const { width, height } = this.scale
    this.add.text(width / 2, 60, '侦探手册', { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)

    const content = [
      '估算神功：凑个整，估个大概，跑偏的答案快走开！',
      '尾数追踪术：先看尾巴抓一抓！',
      '奇偶密码：乘法有偶便是偶！',
      '弃九验算法：数字加加加，加到一位查一查！',
      '逆运算大法：加变减，乘变除，反向追踪不会输！',
      '和11交朋友：两头一拉，中间一加！'
    ].join('\n')

    this.add.text(80, 120, content, { fontFamily: 'sans-serif', fontSize: '18px', color: '#a9ffea', wordWrap: { width: width - 160 } })

    const back = this.add.text(width / 2, height - 80, '返回', { fontFamily: 'sans-serif', fontSize: '22px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    back.on('pointerup', () => this.scene.start('MainMenuScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'))
  }
}
