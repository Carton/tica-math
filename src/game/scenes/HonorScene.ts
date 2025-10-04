import Phaser from 'phaser'
import { SaveManager } from '@/game/managers/SaveManager'
import { Strings } from '@/game/managers/Strings'
import { createTextButton } from '@/game/utils/uiFactory'

export default class HonorScene extends Phaser.Scene {
  constructor() {
    super('HonorScene')
  }

  create() {
    const { width, height } = this.scale

    // 标题
    this.add.text(width / 2, 60, Strings.t('ui.honor_title'), { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)

    // 获取所有用户并按exp分数排序
    const users = SaveManager.getAllUsers()
    const cur = SaveManager.getCurrentUserId()

    // 按exp从高到低排序，EXP相同时按徽章数排序
    const sortedUsers = [...users].sort((a, b) => {
      if (b.data.exp !== a.data.exp) {
        return b.data.exp - a.data.exp  // 先按EXP排序
      }
      return b.data.badges.length - a.data.badges.length  // EXP相同时按徽章数排序
    })

    let y = 120
    sortedUsers.forEach(({ id, data }, index) => {
      const isCurrentUser = id === cur
      const prefix = isCurrentUser ? '→ ' : '  ' // 当前用户用箭头标识
      const line = this.add.text(80, y, `${prefix}${index + 1}. ${id}  ${Strings.t('ui.level_prefix')}${data.bestLevel}  ${Strings.t('ui.badges_count')}:${data.badges.length}  ${Strings.t('ui.exp_prefix')}${data.exp}`, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: isCurrentUser ? '#2de1c2' : '#a9ffea'
      }) // 移除interactive，不允许点击切换

      y += 32
    })

    // 返回按钮
    const back = createTextButton(this, width / 2, height - 80, {
      text: Strings.t('ui.return'),
      style: { backgroundColor: '#a9ffea' },
      configKey: 'button',
    })
    back.on('pointerup', () => this.scene.start('MainMenuScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'))
  }
}
