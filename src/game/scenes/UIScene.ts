export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private toolsContainer!: Phaser.GameObjects.Container

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

  createUIBackground() {
    const background = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      80,
      0x0f1320,
      0.8
    )
    background.setOrigin(0, 0)
  }

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

  createTools() {
    const startX = this.cameras.main.width / 2 - 150
    const y = 40

    this.toolsContainer = this.add.container(0, 0)

    const tools = [
      { name: 'magnify', icon: '🔍', label: '放大镜' },
      { name: 'time', icon: '⏰', label: '怀表' },
      { name: 'insight', icon: '💡', label: '闪电' }
    ]

    tools.forEach((tool, index) => {
      const x = startX + index * 150
      const toolButton = this.createToolButton(x, y, tool.icon, tool.label, tool.name)
      this.toolsContainer.add(toolButton)
    })
  }

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

    container.add([background, iconText, labelText])

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
  }

  updateToolDisplay(toolName: string, uses: number) {
    // Update tool display based on remaining uses
  }
}