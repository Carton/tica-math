import { EventBus, emit, on, off, type EventPayloads } from '@/game/managers/EventBus'

describe('EventBus', () => {
  beforeEach(() => {
    // 清理所有事件监听器
    ;(EventBus as any).map.clear()
  })

  test('应该正确注册和触发事件', () => {
    const handler = jest.fn()
    on('game:start', handler)

    emit('game:start', { level: 1 })

    expect(handler).toHaveBeenCalledWith({ level: 1 })
  })

  test('应该支持多个处理器监听同一事件', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    on('game:start', handler1)
    on('game:start', handler2)

    emit('game:start', { level: 1 })

    expect(handler1).toHaveBeenCalledWith({ level: 1 })
    expect(handler2).toHaveBeenCalledWith({ level: 1 })
  })

  test('应该正确取消事件监听', () => {
    const handler = jest.fn()

    on('game:start', handler)
    off('game:start', handler)

    emit('game:start', { level: 1 })

    expect(handler).not.toHaveBeenCalled()
  })

  test('处理器错误不应该影响其他处理器', () => {
    const handler1 = jest.fn().mockImplementation(() => {
      throw new Error('Test error')
    })
    const handler2 = jest.fn()

    on('game:start', handler1)
    on('game:start', handler2)

    // 应该不会抛出错误
    expect(() => {
      emit('game:start', { level: 1 })
    }).not.toThrow()

    expect(handler2).toHaveBeenCalledWith({ level: 1 })
  })

  test('发射不存在的事件应该安全处理', () => {
    expect(() => {
      emit('nonexistent:event', {} as any)
    }).not.toThrow()
  })

  test('取消不存在的监听器应该安全处理', () => {
    const handler = jest.fn()

    expect(() => {
      off('nonexistent:event', handler)
    }).not.toThrow()
  })

  test('当最后一个监听器被移除时应该清理事件', () => {
    const handler = jest.fn()

    on('game:start', handler)
    expect((EventBus as any).map.has('game:start')).toBe(true)

    off('game:start', handler)
    expect((EventBus as any).map.has('game:start')).toBe(false)
  })

  test('类型安全的emit和on应该正常工作', () => {
    const handler = jest.fn()

    // TypeScript类型检查
    on('ui:feedback', handler)
    emit('ui:feedback', { type: 'correct' })

    expect(handler).toHaveBeenCalledWith({ type: 'correct' })
  })
})