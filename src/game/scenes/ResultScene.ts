import Phaser from 'phaser'
import type { ResultSummary } from '@/game/utils/types'
import { resultPrimaryActionLabel } from '@/game/utils/gameFlow'
import { AudioManager } from '@/game/managers/AudioManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { SaveManager } from '@/game/managers/SaveManager'

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene')
  }

  create(data: { summary?: ResultSummary; nextLevel?: number }) {
    const { width, height } = this.scale
    const sum = data.summary

    // 播放结果音效
    if (sum?.pass) {
      AudioManager.playSfx('sfx_win_level') // 闯关成功播放胜利音效
    } else {
      AudioManager.playSfx('sfx_lose_level') // 闯关失败播放失败音效
    }

    const title = this.add.text(width / 2, height / 2 - 140, sum?.pass ? '案件告破！' : '让教授逃跑了！', {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5)

    // 计算EXP详情（只有闯关成功才显示）
    let expDetail = ''
    if (sum?.pass) {
      const baseEXP = Math.round((sum?.accuracy ?? 0) * 100)
      const comboBonus = SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, baseEXP)
      const totalEXP = baseEXP + comboBonus

      expDetail = `EXP获得：${totalEXP} (基础${baseEXP}`
      if (comboBonus > 0) {
        expDetail += ` + 连击加成${comboBonus}`
      }
      expDetail += ')\n'
    }

    const detail = this.add.text(width / 2, title.y + 70,
      `${expDetail}正确率：${Math.round((sum?.accuracy ?? 0) * 100)}%\n评级：${sum?.grade ?? 'C'}\n连击：${sum?.comboMax ?? 0}，道具使用：${sum?.toolsUsed ?? 0}`,
      { fontFamily: 'sans-serif', fontSize: '20px', color: '#a9ffea', align: 'center' }
    ).setOrigin(0.5)

    // 如果有连击加成，给连击数字添加特殊效果
    if (sum?.pass && (sum?.comboMax ?? 0) >= 3) {
      const comboBonus = SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, Math.round((sum?.accuracy ?? 0) * 100))
      if (comboBonus > 0) {
        // 创建连击加成的提示文字
        const bonusText = this.add.text(width / 2, detail.y + 80,
          `🔥 连击加成 +${comboBonus} EXP！`, {
          fontFamily: 'sans-serif',
          fontSize: '24px',
          color: '#ffd166',
          fontStyle: 'bold',
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            shadowStroke: true,
            shadowFill: true
          }
        }).setOrigin(0.5).setAlpha(0)

        // 动画效果
        this.tweens.add({
          targets: bonusText,
          alpha: 1,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 400,
          ease: 'Back.out',
          yoyo: true,
          hold: 800,
          onComplete: () => {
            bonusText.destroy()
          }
        })
      }
    }

    // 计算按钮位置，如果有连击加成提示则向下移动
    const buttonStartY = detail.y + (sum?.pass && (sum?.comboMax ?? 0) >= 3 && SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, Math.round((sum?.accuracy ?? 0) * 100)) > 0 ? 160 : 120)

    const back = this.add.text(width / 2, buttonStartY, '返回事务所', {
      fontFamily: 'sans-serif', fontSize: '24px', color: '#0b1021', backgroundColor: '#a9ffea', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    const primaryLabel = resultPrimaryActionLabel(!!sum?.pass)
    const primary = this.add.text(width / 2, back.y + 60, primaryLabel, {
      fontFamily: 'sans-serif', fontSize: '22px', color: '#0b1021', backgroundColor: '#2de1c2', padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    back.on('pointerup', () => {
      this.scene.stop('UIScene')
      this.scene.stop('GameScene')
      this.scene.start('MainMenuScene')
    })

    primary.on('pointerup', () => {
      this.scene.stop('ResultScene')
      // 重置道具数量到默认值
      ToolManager.resetToDefault()

      if (sum?.pass && data.nextLevel) {
        const level = data.nextLevel
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      } else {
        const level = sum?.level ?? 1
        if (this.scene.isActive('GameScene')) this.scene.stop('GameScene')
        if (this.scene.isActive('UIScene')) this.scene.stop('UIScene')
        this.scene.launch('UIScene', { level })
        this.scene.start('GameScene', { level })
      }
    })

    this.input.keyboard?.once('keydown-ENTER', () => primary.emit('pointerup'))
  }
}
