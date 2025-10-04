/**
 * 移动端输入辅助工具
 * 解决移动设备上虚拟键盘和输入问题
 */
export interface MobileInputOptions {
  placeholder?: string
  maxLength?: number
  inputType?: 'text' | 'number' | 'email'
  autoCorrect?: boolean
  autoCapitalize?: boolean
  onComplete?: (value: string) => void
  onCancel?: () => void
  onInput?: (value: string) => void
}

export class MobileInputHelper {
  private static instance: MobileInputHelper
  private activeInput: HTMLInputElement | null = null
  private overlay: HTMLDivElement | null = null
  private currentCallback: ((value: string) => void) | null = null

  private constructor() {
    this.init()
  }

  public static getInstance(): MobileInputHelper {
    if (!MobileInputHelper.instance) {
      MobileInputHelper.instance = new MobileInputHelper()
    }
    return MobileInputHelper.instance
  }

  private init(): void {
    // 监听虚拟键盘事件
    this.setupKeyboardListeners()

    // 监听屏幕方向变化
    this.setupOrientationListeners()
  }

  /**
   * 设置键盘监听器
   */
  private setupKeyboardListeners(): void {
    // iOS虚拟键盘处理
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      window.addEventListener('focusin', this.handleVirtualKeyboardShow.bind(this))
      window.addEventListener('focusout', this.handleVirtualKeyboardHide.bind(this))
    }

    // Android虚拟键盘处理
    if (/Android/.test(navigator.userAgent)) {
      const originalHeight = window.innerHeight
      window.addEventListener('resize', () => {
        const currentHeight = window.innerHeight
        if (currentHeight < originalHeight) {
          this.handleVirtualKeyboardShow()
        } else {
          this.handleVirtualKeyboardHide()
        }
      })
    }
  }

  /**
   * 设置屏幕方向监听器
   */
  private setupOrientationListeners(): void {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustInputPosition()
      }, 100)
    })
  }

  /**
   * 处理虚拟键盘显示
   */
  private handleVirtualKeyboardShow(): void {
    // 滚动到输入框位置
    if (this.activeInput) {
      setTimeout(() => {
        this.activeInput!.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 300)
    }

    // 调整页面布局
    document.body.style.height = `${window.innerHeight}px`
    document.body.style.overflow = 'hidden'
  }

  /**
   * 处理虚拟键盘隐藏
   */
  private handleVirtualKeyboardHide(): void {
    // 恢复页面布局
    document.body.style.height = ''
    document.body.style.overflow = ''
  }

  /**
   * 调整输入框位置
   */
  private adjustInputPosition(): void {
    if (this.overlay && this.activeInput) {
      const screenHeight = window.innerHeight
      const overlayHeight = this.overlay.offsetHeight
      const inputRect = this.activeInput.getBoundingClientRect()

      // 确保输入框在可视区域内
      if (inputRect.bottom > screenHeight * 0.7) {
        this.overlay.style.transform = `translateY(-${inputRect.bottom - screenHeight * 0.6}px)`
      } else {
        this.overlay.style.transform = ''
      }
    }
  }

  /**
   * 显示移动端输入对话框
   */
  public showInput(options: MobileInputOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      this.createInputOverlay(options, resolve, reject)
    })
  }

  /**
   * 创建输入覆盖层
   */
  private createInputOverlay(
    options: MobileInputOptions,
    resolve: (value: string) => void,
    reject: () => void
  ): void {
    // 移除现有的覆盖层
    this.hideInput()

    // 创建覆盖层
    this.overlay = document.createElement('div')
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      padding: 20px;
      box-sizing: border-box;
    `

    // 创建输入容器
    const inputContainer = document.createElement('div')
    inputContainer.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 20px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `

    // 创建标题
    const title = document.createElement('div')
    title.textContent = options.placeholder || '请输入'
    title.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      text-align: center;
      color: #333;
    `

    // 创建输入框
    this.activeInput = document.createElement('input')
    this.activeInput.type = options.inputType || 'text'
    this.activeInput.placeholder = options.placeholder || ''
    this.activeInput.maxLength = options.maxLength || 50
    this.activeInput.setAttribute('autocorrect', options.autoCorrect ? 'on' : 'off')
    this.activeInput.setAttribute('autocapitalize', options.autoCapitalize ? 'sentences' : 'off')
    this.activeInput.style.cssText = `
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
      box-sizing: border-box;
      margin-bottom: 15px;
      outline: none;
    `

    // 设置焦点和选择所有文本
    setTimeout(() => {
      this.activeInput!.focus()
      this.activeInput!.select()
    }, 100)

    // 输入事件处理
    this.activeInput.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      if (options.onInput) {
        options.onInput(value)
      }
    })

    // 回车键确认
    this.activeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.confirmInput(resolve)
      } else if (e.key === 'Escape') {
        this.cancelInput(reject)
      }
    })

    // 创建按钮容器
    const buttonContainer = document.createElement('div')
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `

    // 创建确认按钮
    const confirmButton = document.createElement('button')
    confirmButton.textContent = '确认'
    confirmButton.style.cssText = `
      padding: 10px 20px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      min-width: 80px;
    `
    confirmButton.addEventListener('click', () => {
      this.confirmInput(resolve)
    })

    // 创建取消按钮
    const cancelButton = document.createElement('button')
    cancelButton.textContent = '取消'
    cancelButton.style.cssText = `
      padding: 10px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      min-width: 80px;
    `
    cancelButton.addEventListener('click', () => {
      this.cancelInput(reject)
    })

    // 组装元素
    buttonContainer.appendChild(confirmButton)
    buttonContainer.appendChild(cancelButton)
    inputContainer.appendChild(title)
    inputContainer.appendChild(this.activeInput)
    inputContainer.appendChild(buttonContainer)
    this.overlay.appendChild(inputContainer)

    // 点击背景取消
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.cancelInput(reject)
      }
    })

    // 添加到页面
    document.body.appendChild(this.overlay)

    // 调整位置
    this.adjustInputPosition()
  }

  /**
   * 确认输入
   */
  private confirmInput(resolve: (value: string) => void): void {
    if (this.activeInput) {
      const value = this.activeInput.value.trim()
      resolve(value)
      this.hideInput()
    }
  }

  /**
   * 取消输入
   */
  private cancelInput(reject: () => void): void {
    reject()
    this.hideInput()
  }

  /**
   * 隐藏输入对话框
   */
  public hideInput(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
    if (this.activeInput) {
      this.activeInput.blur()
      this.activeInput = null
    }
    this.currentCallback = null
    this.handleVirtualKeyboardHide()
  }

  /**
   * 创建游戏内输入组件（适用于Phaser场景）
   */
  public createGameInput(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    options: MobileInputOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // 创建游戏对象作为输入框的视觉表示
      const inputBackground = scene.add.rectangle(x, y, width, height, 0xffffff)
        .setStrokeStyle(2, 0x000000)

      const inputText = scene.add.text(x, y, options.placeholder || '', {
        fontSize: '16px',
        color: '#666666',
        fontFamily: 'Arial'
      }).setOrigin(0.5)

      // 创建触摸区域
      const hitArea = scene.add.zone(x, y, width, height)
        .setInteractive({ useHandCursor: true })

      hitArea.on('pointerdown', async () => {
        // 显示移动端输入对话框
        try {
          const result = await this.showInput({
            ...options,
            placeholder: options.placeholder || '请输入名字'
          })

          // 更新显示文本
          inputText.setText(result)
          inputText.setStyle({ color: '#000000' })

          resolve(result)
        } catch (error) {
          // 用户取消了输入
          reject(error)
        }
      })

      // 添加悬停效果
      hitArea.on('pointerover', () => {
        inputBackground.setFillStyle(0xf0f0f0)
      })

      hitArea.on('pointerout', () => {
        inputBackground.setFillStyle(0xffffff)
      })

      // 返回控制对象
      return {
        setText: (text: string) => {
          inputText.setText(text)
          inputText.setStyle({ color: '#000000' })
        },
        getText: () => inputText.text,
        destroy: () => {
          inputBackground.destroy()
          inputText.destroy()
          hitArea.destroy()
        }
      }
    })
  }

  /**
   * 检测是否为移动设备
   */
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  /**
   * 检测是否为iPad
   */
  public isiPad(): boolean {
    return /iPad/.test(navigator.userAgent)
  }

  /**
   * 获取当前视口高度（考虑虚拟键盘）
   */
  public getViewportHeight(): number {
    return window.innerHeight
  }

  /**
   * 获取安全区域（适用于刘海屏等）
   */
  public getSafeArea(): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    // 获取CSS安全区域
    const computedStyle = getComputedStyle(document.documentElement)
    const top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0')
    const right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')
    const bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0')
    const left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')

    return { top, right, bottom, left }
  }
}