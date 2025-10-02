import Phaser from 'phaser'

export default class ManualScene extends Phaser.Scene {
  private scrollContainer!: Phaser.GameObjects.Container
  private contentHeight = 0
  private scrollBar!: Phaser.GameObjects.Container
  private scrollThumb!: Phaser.GameObjects.Rectangle
  private isDraggingThumb = false
  private maxY = 0
  private minY = 0

  constructor() {
    super('ManualScene')
  }

  create() {
    const { width, height } = this.scale

    // 标题
    this.add.text(width / 2, 40, '🕵️ 侦探手册 🕵️', { fontFamily: 'sans-serif', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5)

    // 创建可滚动的内容容器
    this.scrollContainer = this.add.container(0, 80)

    let y = 20  // 从20开始，给第一个标题留出空间

    // === 答题操作说明 ===
    this.addSectionTitle('🎯 如何答题', y)
    y += 40

    this.addContentText('🖱️ 鼠标操作：', y, 'bold')
    y += 30
    this.addContentText('点击"真相"印章 = 题目是对的\n点击"伪证"印章 = 题目是错的', y, 'normal')
    y += 60

    // 添加印章图标
    if (this.textures.exists('stamp_true') && this.textures.exists('stamp_false')) {
      const stampTrue = this.add.image(width/2 - 100, y, 'stamp_true').setOrigin(0.5).setDisplaySize(80, 80)
      const stampFalse = this.add.image(width/2 + 100, y, 'stamp_false').setOrigin(0.5).setDisplaySize(80, 80)
      this.scrollContainer.add([stampTrue, stampFalse])
      y += 100
    }

    this.addContentText('⌨️ 键盘操作：', y, 'bold')
    y += 30
    this.addContentText('按 T 键或 → 键 = 选择真相\n按 F 键或 ← 键 = 选择伪证', y, 'normal')
    y += 80

    // === 道具说明 ===
    this.addSectionTitle('🔧 侦探道具', y)
    y += 40

    // 道具1：放大镜
    this.addToolSection('放大镜', y, '仔细观察题目线索，获得提示！')
    y += 80

    // 道具2：手表
    this.addToolSection('怀表', y, '时间增加10秒，慢慢思考~')
    y += 80

    // 道具3：灯泡
    this.addToolSection('灯泡', y, '直接显示正确答案！但只能用三次哦~')
    y += 80

    // === 答题技巧 ===
    this.addSectionTitle('🧠 侦探技巧', y)
    y += 40

    const tips = [
      '估算神功：凑个整，估个大概，跑偏的答案快走开！',
      '尾数追踪术：先看尾巴抓一抓！',
      '奇偶密码：乘法有偶便是偶！',
      '弃九验算法：数字加加加，加到一位查一查！',
    ]

    tips.forEach(tip => {
      this.addContentText(`• ${tip}`, y, 'normal')
      y += 35
    })

    // === EXP和徽章说明（放到最后） ===
    y += 40  // 额外的间距
    this.addSectionTitle('🏆 成就系统', y)
    y += 40

    this.addContentText('💰 EXP经验值：', y, 'bold')
    y += 30
    this.addContentText('成功破案就能获得经验值！\n答得越准，经验越多~', y, 'normal')
    y += 60

    this.addContentText('🎖️ 徽章：', y, 'bold')
    y += 30
    this.addContentText('获得S级评价就能得到徽章！\n每个关卡的S徽章都可以收集哦~', y, 'normal')
    y += 80

    this.contentHeight = y + 50

    // 设置遮罩区域和滚动范围
    const maskY = 80
    const maskHeight = height - 160
    this.maxY = maskY
    this.minY = maskY - (this.contentHeight - maskHeight)

    // 确保内容容器从顶部开始
    this.scrollContainer.y = this.maxY

  
    const maskShape = this.make.graphics()
      .fillRect(0, maskY, width, maskHeight)
    this.scrollContainer.setMask(maskShape.createGeometryMask())

    // 创建可拖拽的透明背景用于滚动
    if (this.contentHeight > maskHeight) {
      const dragArea = this.add.rectangle(width / 2, maskY + maskHeight / 2, width - 80, maskHeight, 0xffffff, 0)
        .setOrigin(0.5)
        .setInteractive({ draggable: true })

      // 监听拖拽事件
      dragArea.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        // dragY是拖拽的增量，向下拖拽时dragY为正，应该让内容向上移动（Y减少）
        this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y + dragY, this.minY, this.maxY)
        this.updateThumbPosition(maskY, maskHeight)
      })

      // 鼠标滚轮支持 - 反转deltaY以符合预期行为
      this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number) => {
        let newY = this.scrollContainer.y - deltaY * 2  // 反转deltaY，使向下滚动让内容向上移动
        newY = Phaser.Math.Clamp(newY, this.minY, this.maxY)
        this.scrollContainer.y = newY
        this.updateThumbPosition(maskY, maskHeight)
      })

      // 创建滚动条
      this.createScrollBar(width, height, maskY, maskHeight)

      // 初始化滚动条位置（确保从内容顶部开始）
      this.updateThumbPosition(maskY, maskHeight)
    }

    // 返回按钮
    const back = this.add.text(width / 2, height - 40, '返回', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#0b1021',
      backgroundColor: '#a9ffea',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
    back.on('pointerup', () => this.scene.start('MainMenuScene'))

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MainMenuScene'))
  }

  private addSectionTitle(title: string, y: number) {
    const { width } = this.scale
    const titleText = this.add.text(width/2, y, title, {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#ffd166',
      backgroundColor: '#1a2332',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5)
    this.scrollContainer.add(titleText)
  }

  private addContentText(text: string, y: number, style: 'bold' | 'normal') {
    const { width } = this.scale
    const contentText = this.add.text(80, y, text, {
      fontFamily: 'sans-serif',
      fontSize: style === 'bold' ? '20px' : '18px',
      color: '#a9ffea',
      fontStyle: style === 'bold' ? 'bold' : 'normal',
      wordWrap: { width: width - 160 }
    })
    this.scrollContainer.add(contentText)
  }

  private addToolSection(toolName: string, y: number, description: string) {
    const { width } = this.scale

    // 工具图标（如果有的话）
    const useIcons = this.textures.exists('icons_magnify') && this.textures.exists('icons_watch') && this.textures.exists('icons_light')

    if (useIcons) {
      let iconKey = ''
      if (toolName.includes('放大镜')) iconKey = 'icons_magnify'
      else if (toolName.includes('怀表')) iconKey = 'icons_watch'
      else if (toolName.includes('灯泡')) iconKey = 'icons_light'

      if (iconKey) {
        const icon = this.add.image(100, y + 24, iconKey).setOrigin(0.5).setDisplaySize(48, 48)
        this.scrollContainer.add(icon)

        // 工具名称（与图标中心对齐）
        const nameText = this.add.text(160, y + 5, toolName, {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#ffd166',
          fontStyle: 'bold'
        })
        this.scrollContainer.add(nameText)

        // 工具描述（在名称下方）
        const descText = this.add.text(160, y + 35, description, {
          fontFamily: 'sans-serif',
          fontSize: '18px',
          color: '#a9ffea',
          wordWrap: { width: width - 320 }
        })
        this.scrollContainer.add(descText)
      }
    } else {
      // 没有图标时的布局
      // 工具名称
      const nameText = this.add.text(80, y, toolName, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#ffd166',
        fontStyle: 'bold'
      })
      this.scrollContainer.add(nameText)

      // 工具描述
      const descText = this.add.text(80, y + 30, description, {
        fontFamily: 'sans-serif',
        fontSize: '18px',
        color: '#a9ffea',
        wordWrap: { width: width - 160 }
      })
      this.scrollContainer.add(descText)
    }
  }

  private createScrollBar(width: number, height: number, maskY: number, maskHeight: number) {
    const scrollBarX = width - 40
    const scrollBarWidth = 12
    const thumbHeight = Math.max(40, (maskHeight / this.contentHeight) * maskHeight)

    // 滚动条轨道
    const track = this.add.rectangle(scrollBarX, maskY + maskHeight / 2, scrollBarWidth, maskHeight, 0x3a4a5c)
      .setOrigin(0.5)

    // 滚动条滑块
    this.scrollThumb = this.add.rectangle(scrollBarX, maskY + thumbHeight / 2, scrollBarWidth, thumbHeight, 0x2de1c2)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.scrollBar = this.add.container(0, 0, [track, this.scrollThumb])

    // 滑块交互
    this.scrollThumb.on('pointerdown', () => {
      this.isDraggingThumb = true
    })

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDraggingThumb) {
        this.updateScrollFromThumb(pointer.y, maskY, maskHeight)
      }
    })

    this.input.on('pointerup', () => {
      this.isDraggingThumb = false
    })

    // 点击轨道直接跳转到位置
    track.setInteractive()
    track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const relativeY = pointer.y - maskY
      const scrollRatio = Math.max(0, Math.min(1, relativeY / maskHeight))
      const targetY = this.maxY - (this.maxY - this.minY) * scrollRatio
      this.scrollContainer.y = Phaser.Math.Clamp(targetY, this.minY, this.maxY)
      this.updateThumbPosition(maskY, maskHeight)
      })
  }

  private updateScrollFromThumb(thumbY: number, maskY: number, maskHeight: number) {
    const thumbHeight = Math.max(40, (maskHeight / this.contentHeight) * maskHeight)

    // 计算滑块可移动的范围
    const thumbMinY = maskY + thumbHeight / 2
    const thumbMaxY = maskY + maskHeight - thumbHeight / 2

    // 限制滑块位置
    const clampedThumbY = Phaser.Math.Clamp(thumbY, thumbMinY, thumbMaxY)

    // 计算滑块在可移动范围内的相对位置 (0-1)
    const scrollRatio = (clampedThumbY - thumbMinY) / (thumbMaxY - thumbMinY)

    // 根据比例计算内容容器的位置，与updateThumbPosition保持一致
    let newY = this.maxY - (this.maxY - this.minY) * scrollRatio
    newY = Phaser.Math.Clamp(newY, this.minY, this.maxY)
    this.scrollContainer.y = newY

    // 确保滑块位置正确
    this.scrollThumb.y = clampedThumbY

    }

  private updateThumbPosition(maskY: number, maskHeight: number) {
    const thumbHeight = Math.max(40, (maskHeight / this.contentHeight) * maskHeight)

    // 计算滑块可移动的范围
    const thumbMinY = maskY + thumbHeight / 2
    const thumbMaxY = maskY + maskHeight - thumbHeight / 2

    // 计算滚动进度 (0-1)，当内容在顶部时进度为0
    const scrollProgress = (this.maxY - this.scrollContainer.y) / (this.maxY - this.minY)
    // 确保进度在0-1范围内
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress))

    // 根据进度计算滑块位置
    const thumbY = thumbMinY + (thumbMaxY - thumbMinY) * clampedProgress
    this.scrollThumb.y = thumbY

      }
}
