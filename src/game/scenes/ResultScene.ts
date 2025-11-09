import Phaser from 'phaser'
import type { ResultSummary, WrongAnswer } from '@/game/utils/types'
import { resultPrimaryActionLabel } from '@/game/utils/gameFlow'
import { AudioManager } from '@/game/managers/AudioManager'
import { ToolManager } from '@/game/managers/ToolManager'
import { SaveManager } from '@/game/managers/SaveManager'
import { Strings } from '@/game/managers/Strings'
import { createTextButton } from '@/game/utils/uiFactory'

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

    const title = this.add.text(width / 2, height / 2 - 180, sum?.pass ? Strings.t('results.case_cleared') : Strings.t('results.professor_escaped'), {
      fontFamily: 'sans-serif', fontSize: '36px', color: '#ffffff'
    }).setOrigin(0.5)

    // 计算EXP详情（只有闯关成功才显示）
    let expDetail = ''
    if (sum?.pass) {
      const baseEXP = Math.round((sum?.accuracy ?? 0) * 100)
      const comboBonus = SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, baseEXP)
      const totalEXP = baseEXP + comboBonus

      expDetail = `${Strings.t('results.exp_gained')}${totalEXP} (${Strings.t('results.exp_base')}${baseEXP}`
      if (comboBonus > 0) {
        expDetail += ` + ${Strings.t('results.exp_combo_bonus')}${comboBonus}`
      }
      expDetail += ')\n'
    }

    const detailText = `${expDetail}${Strings.t('results.accuracy')}${Math.round((sum?.accuracy ?? 0) * 100)}%\n${Strings.t('results.grade')}${sum?.grade ?? 'C'}\n${Strings.t('results.combo')}${sum?.comboMax ?? 0}，${Strings.t('results.tools_used')}${sum?.toolsUsed ?? 0}`
    const detail = this.add.text(width / 2, title.y + 60, detailText, {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#a9ffea', align: 'center'
    }).setOrigin(0.5)

    // 添加错题显示区域
    let wrongAnswersSection: Phaser.GameObjects.Container | undefined
    let wrongAnswersY = detail.y + 140

    if (sum?.wrongAnswers && sum.wrongAnswers.length > 0) {
      // 创建错题显示区域
      wrongAnswersSection = this.createWrongAnswersSection(width, wrongAnswersY, sum.wrongAnswers)
      wrongAnswersY += 115 // 错题区域高度（180px + 15px间距）
    }

    // 如果有连击加成，给连击数字添加特殊效果
    if (sum?.pass && (sum?.comboMax ?? 0) >= 3) {
      const comboBonus = SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, Math.round((sum?.accuracy ?? 0) * 100))
      if (comboBonus > 0) {
        // 创建连击加成的提示文字
        const bonusText = this.add.text(width / 2, wrongAnswersY + 20,
          Strings.t('results.combo_bonus_text').replace('{0}', comboBonus.toString()), {
          fontFamily: 'sans-serif',
          fontSize: '24px',
          color: '#ffd166',
          fontStyle: 'bold',
          shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            fill: true
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

    // 计算按钮位置
    const hasComboBonus = sum?.pass && (sum?.comboMax ?? 0) >= 3 && SaveManager.calculateComboEXPBonus(sum?.comboMax ?? 0, Math.round((sum?.accuracy ?? 0) * 100)) > 0
    const buttonStartY = wrongAnswersY + (hasComboBonus ? 60 : 30) // 减少间距

    const back = createTextButton(this, width / 2, buttonStartY, {
      text: Strings.t('ui.back_to_agency'),
      configKey: 'primaryButton',
    })

    const primaryLabel = resultPrimaryActionLabel(!!sum?.pass, Strings.t.bind(Strings))
    const primary = createTextButton(this, width / 2, back.y + 80, {
      text: primaryLabel,
      configKey: 'primaryButton',
    })

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

  private createWrongAnswersSection(screenWidth: number, startY: number, wrongAnswers: WrongAnswer[]): Phaser.GameObjects.Container {
    // 创建滚动容器
    const container = this.add.container(screenWidth / 2, startY)

    // 背景面板 - 根据错题卡片宽度调整，为滚动条留出空间
    const cardWidth = 650 // 错题卡片宽度
    const panelWidth = cardWidth + 60 // 为滚动条和边距留出空间
    const panelHeight = 180 // 减小高度，避免空间浪费
    const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x1a1a2e, 0.9)
      .setStrokeStyle(2, 0x16213e)

    // 创建遮罩图形 - 用于限制可见区域
    const maskGraphics = this.add.graphics()
    maskGraphics.fillStyle(0xffffff)
    maskGraphics.fillRect(screenWidth / 2 - panelWidth / 2, startY - panelHeight / 2, panelWidth, panelHeight)
    const mask = maskGraphics.createGeometryMask()
    maskGraphics.setVisible(false) // 确保遮罩图形不可见

    // 创建可滚动内容区域
    const scrollContent = this.add.container(0, 0)

    // 题目卡片间距和尺寸
    const cardHeight = 30 // 使用新的卡片高度
    const cardSpacing = 6 // 进一步减小间距
    let currentY = -panelHeight / 2 + 25 // 从顶部开始，留出空间

    wrongAnswers.forEach((wrongAnswer, index) => {
      const card = this.createWrongAnswerCard(0, currentY, wrongAnswer, index + 1)
      scrollContent.add(card)
      currentY += cardHeight + cardSpacing
    })

    // 设置滚动区域
    const contentHeight = currentY + 30
    const maxY = Math.max(0, contentHeight - panelHeight)

    // 添加滚动功能
    let scrollY = 0
    const scrollSpeed = 3 // 稍微加快滚动速度

    // 创建滚动条
    if (maxY > 0) {
      const scrollbarWidth = 8
      const scrollbarHeight = Math.max(20, panelHeight * (panelHeight / contentHeight))
      const scrollbar = this.add.rectangle(panelWidth / 2 - 20, 0, scrollbarWidth, scrollbarHeight, 0x4a5568, 0.8)

      // 鼠标滚轮事件 - 使用更精确的边界检测
      this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
        const bounds = panel.getBounds()
        if (pointer.x >= bounds.x && pointer.x <= bounds.x + bounds.width &&
            pointer.y >= bounds.y && pointer.y <= bounds.y + bounds.height) {
          scrollY = Phaser.Math.Clamp(scrollY - deltaY * scrollSpeed, -maxY, 0)
          scrollContent.y = scrollY

          // 更新滚动条位置
          const scrollbarY = (scrollY / maxY) * (panelHeight / 2 - scrollbarHeight / 2)
          scrollbar.y = scrollbarY
        }
      })

      container.add(scrollbar)
    }

    // 应用遮罩到滚动内容
    scrollContent.setMask(mask)

    container.add([panel, scrollContent]) // 不添加maskGraphics到容器
    return container
  }

  private createWrongAnswerCard(x: number, y: number, wrongAnswer: WrongAnswer, questionNumber: number): Phaser.GameObjects.Container {
    const card = this.add.container(x, y)

    // 卡片背景 - 增加宽度以容纳更多信息
    const cardWidth = 650
    const cardHeight = 30 // 进一步减小高度
    const bg = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x0f3460, 0.8)
      .setStrokeStyle(1, 0x16213e)

    // 题目编号
    const number = this.add.text(-cardWidth / 2 + 15, 0, `#${questionNumber}`, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#e94560',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5)

    // 题目表达式 - 增加可用宽度
    const question = this.add.text(-cardWidth / 2 + 50, 0, wrongAnswer.questionString, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 280 } // 增加宽度
    }).setOrigin(0, 0.5)

    // 用户选择和正确答案 - 在同一行显示
    const userChoice = wrongAnswer.userChoice ? Strings.t('ui.true') : Strings.t('ui.false')
    const userChoiceColor = wrongAnswer.userChoice ? '#4ecdc4' : '#ff6b6b'
    const correctChoice = wrongAnswer.correctAnswer ? Strings.t('ui.true') : Strings.t('ui.false')

    // 分别创建用户选择和正确答案文本，使用不同颜色
    const yourChoiceText = Strings.t('results.your_choice')
    const correctAnswerText = Strings.t('results.correct_answer')

    // 用户选择文本 - 使用对应的颜色
    const userChoiceTextObj = this.add.text(-cardWidth / 2 + 340, 0, `${yourChoiceText}: ${userChoice}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: userChoiceColor
    }).setOrigin(0, 0.5)


    // 正确答案文本 - 使用绿色
    const correctChoiceTextObj = this.add.text(-cardWidth / 2 + 475, 0, `${correctAnswerText}: ${correctChoice}`, {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#95e1d3'
    }).setOrigin(0, 0.5)

    card.add([bg, number, question, userChoiceTextObj, correctChoiceTextObj])
    return card
  }
}
