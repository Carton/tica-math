import type Phaser from 'phaser'
import { createTextButton } from '@/game/utils/uiFactory'

describe('uiFactory', () => {
  const createMockScene = () => {
    const handlers: Record<string, Array<(...args: unknown[]) => void>> = {}
    const textMock = jest.fn((x: number, y: number, content: string, style: Phaser.Types.GameObjects.Text.TextStyle) => ({
      x,
      y,
      text: content,
      style,
      originX: 0,
      originY: 0,
      fixedWidth: 0,
      fixedHeight: 0,
      interactiveConfig: undefined as unknown,
      setOrigin(originX: number, originY: number) {
        this.originX = originX
        this.originY = originY
        return this
      },
      setFixedSize(width: number, height: number) {
        this.fixedWidth = width
        this.fixedHeight = height
        return this
      },
      setInteractive(config: any) {
        this.interactiveConfig = config
        return this
      },
      on(event: string, handler: (...args: unknown[]) => void) {
        handlers[event] ??= []
        handlers[event].push(handler)
        return this
      },
      emit(event: string, ...args: unknown[]) {
        handlers[event]?.forEach(h => h(...args))
      },
    }))

    return {
      add: {
        text: textMock,
      },
    } as unknown as Phaser.Scene & { add: { text: typeof textMock } }
  }

  it('creates a button with default configuration', () => {
    const scene = createMockScene()
    const clickHandler = jest.fn()
    const button = createTextButton(scene, 100, 120, { text: '测试', onClick: clickHandler })

    expect(button.originX).toBe(0.5)
    expect(button.fixedHeight).toBeGreaterThan(0)
    expect(button.interactiveConfig?.useHandCursor).toBe(true)

    button.emit('pointerup')
    expect(clickHandler).toHaveBeenCalledTimes(1)
  })

  it('supports custom width and style overrides', () => {
    const scene = createMockScene()
    const button = createTextButton(scene, 0, 0, {
      text: '宽按钮',
      width: 220,
      style: { backgroundColor: '#ff0000', fontSize: '32px' },
    })

    expect(button.fixedWidth).toBe(220)
    expect(button.style.backgroundColor).toBe('#ff0000')
    expect(button.style.fontSize).toBe('32px')
  })
})

