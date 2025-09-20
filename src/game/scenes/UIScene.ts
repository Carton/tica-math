export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private toolsContainer!: Phaser.GameObjects.Container
  private uiBackground!: Phaser.GameObjects.Rectangle
  private toolButtons: Map<string, Phaser.GameObjects.Container> = new Map()
  private toolUseCounts: Map<string, number> = new Map()

  constructor() {
    super({ key: 'UIScene', active: false })
  }

  create() {
    this.createUIBackground()
    this.createScoreDisplay()
    this.createLevelDisplay()
    this.createTools()
    this.setupEventListeners()
  }

  // createUIBackground is defined at the end of the class

  createScoreDisplay() {
    this.scoreText = this.add.text(20, 20, '得分: 0', {
      fontSize: '18px',
      color: '#ffffff'
    })
  }

  createLevelDisplay() {
    this.levelText = this.add.text(this.cameras.main.width - 20, 20, '第 1 关', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(1, 0)
  }

  // createTools is defined at the end of the class

  createToolButton(x: number, y: number, icon: string, label: string, toolName: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)

    const background = this.add.rectangle(0, 0, 80, 60, 0x2d3748)
    background.setStrokeStyle(2, 0x4a5568)

    const iconText = this.add.text(0, -10, icon, {
      fontSize: '24px'
    }).setOrigin(0.5)

    const labelText = this.add.text(0, 15, label, {
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5)

    // Add count display
    const countText = this.add.text(25, -20, '3', {
      fontSize: '14px',
      color: '#ffd700',
      fontWeight: 'bold'
    }).setOrigin(0.5)

    container.add([background, iconText, labelText, countText])

    container.setInteractive(new Phaser.Geom.Rectangle(-40, -30, 80, 60), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => {
        background.setFillStyle(0x3d4758)
      })
      .on('pointerout', () => {
        background.setFillStyle(0x2d3748)
      })
      .on('pointerdown', () => {
        this.useTool(toolName)
      })

    return container
  }

  useTool(toolName: string) {
    this.game.events.emit('TOOLS/USE', { toolName })
  }

  setupEventListeners() {
    this.game.events.on('SCORE/UPDATE', (data: { score: number }) => {
      this.scoreText.setText(`得分: ${data.score}`)
    })

    this.game.events.on('LEVEL/UPDATE', (data: { level: number }) => {
      this.levelText.setText(`第 ${data.level} 关`)
    })

    this.game.events.on('TOOLS/UPDATE', (data: { toolName: string; uses: number }) => {
      this.updateToolDisplay(data.toolName, data.uses)
    })

    this.game.events.on('TOOLS/INITIALIZE', (data: { tools: any }) => {
      if (typeof data.tools === 'object') {
        Object.entries(data.tools).forEach(([toolName, uses]: [string, any]) => {
          this.updateToolDisplay(toolName, uses)
        })
      }
    })

    this.game.events.on('GAME/RESET', () => {
      this.scoreText.setText('得分: 0')
      this.levelText.setText('第 1 关')
      this.resetTools()
    })
  }

  updateToolDisplay(toolName: string, remainingUses: number) {
    const toolButton = this.toolButtons.get(toolName)
    if (toolButton) {
      const background = toolButton.list[0] as Phaser.GameObjects.Rectangle
      const countText = toolButton.list[3] as Phaser.GameObjects.Text

      const alpha = remainingUses > 0 ? 1 : 0.4
      background.setAlpha(alpha)

      // Add visual indicator for remaining uses
      if (remainingUses > 0) {
        background.setStrokeStyle(2, 0x4a5568)
      } else {
        background.setStrokeStyle(2, 0x718096)
      }

      // Update count display
      if (countText) {
        countText.setText(remainingUses.toString())
        countText.setVisible(remainingUses > 0)
      }
    }

    this.toolUseCounts.set(toolName, remainingUses)
  }

  // Resize handling for responsive UI
  private setupResizeHandler() {
    this.scale.on('resize', this.handleResize.bind(this))
    this.handleResize() // Initial layout
  }

  private handleResize() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    // Update UI background
    if (this.uiBackground) {
      this.uiBackground.setSize(width, 80)
    }

    // Update level text position
    if (this.levelText) {
      this.levelText.setX(width - 20)
    }

    // Update tools position
    if (this.toolsContainer) {
      const startX = width / 2 - 150
      this.toolsContainer.list.forEach((toolButton, index) => {
        if (toolButton instanceof Phaser.GameObjects.Container) {
          toolButton.setX(startX + index * 150)
        }
      })
    }
  }

  // Keyboard shortcuts for better UX
  private setupKeyboardShortcuts() {
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.game.events.emit('TOOLS/USE', { toolName: 'magnify' })
    })

    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.game.events.emit('TOOLS/USE', { toolName: 'timeSlow' })
    })

    this.input.keyboard?.on('keydown-UP', () => {
      this.game.events.emit('TOOLS/USE', { toolName: 'insight' })
    })

    this.input.keyboard?.on('keydown-A', () => {
      this.game.events.emit('GAME/ANSWER', { answer: true })
    })

    this.input.keyboard?.on('keydown-D', () => {
      this.game.events.emit('GAME/ANSWER', { answer: false })
    })
  }

  // Tool management
  private resetTools() {
    this.toolUseCounts.clear()
    this.toolButtons.forEach((button: Phaser.GameObjects.Container, toolName: string) => {
      this.updateToolDisplay(toolName, 3) // Reset to 3 uses
    })
  }

  // Visual feedback
  private showAnswerFeedback(isCorrect: boolean) {
    const centerX = this.cameras.main.width / 2
    const color = isCorrect ? 0x10b981 : 0xef4444

    // Flash the UI background
    this.tweens.add({
      targets: this.uiBackground,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    })
  }

  private createTools() {
    const startX = this.cameras.main.width / 2 - 150
    const y = 40

    this.toolsContainer = this.add.container(0, 0)

    const tools = [
      { name: 'magnify', icon: '🔍', label: '放大镜' },
      { name: 'timeSlow', icon: '⏰', label: '怀表' },
      { name: 'insight', icon: '💡', label: '闪电' }
    ]

    tools.forEach((tool, index) => {
      const x = startX + index * 150
      const toolButton = this.createToolButton(x, y, tool.icon, tool.label, tool.name)
      this.toolsContainer.add(toolButton)
      this.toolButtons.set(tool.name, toolButton)
      this.toolUseCounts.set(tool.name, 3) // Initialize with 3 uses
    })
  }

  private createUIBackground() {
    this.uiBackground = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      80,
      0x0f1320,
      0.9
    )
    this.uiBackground.setOrigin(0, 0)
    this.uiBackground.setDepth(0)
  }
}