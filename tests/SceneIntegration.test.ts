import { emit, on, off, EventBus } from '@/game/managers/EventBus'
import { isPass, nextLevel, resultPrimaryActionLabel } from '@/game/utils/gameFlow'
import { gradeByAccuracy } from '@/game/utils/scoring'

describe('Scene Integration Tests', () => {
  beforeEach(() => {
    // 清理所有事件监听器
    ;(EventBus as any).map.clear()
  })

  describe('游戏状态管理', () => {
    test('应该正确管理游戏暂停状态', () => {
      const pauseStates: boolean[] = []
      let isPaused = false

      on('ui:pause', () => {
        isPaused = true
        pauseStates.push(isPaused)
      })

      on('ui:resume', () => {
        isPaused = false
        pauseStates.push(isPaused)
      })

      emit('ui:pause', undefined)
      emit('ui:resume', undefined)

      expect(pauseStates).toEqual([true, false])
      expect(isPaused).toBe(false)
    })

    test('应该正确处理游戏进度追踪', () => {
      const progressUpdates: Array<{ index: number; total: number }> = []

      on('progress:update', (progress) => {
        progressUpdates.push(progress)
      })

      // 模拟游戏进度
      for (let i = 1; i <= 10; i++) {
        emit('progress:update', { index: i, total: 10 })
      }

      expect(progressUpdates).toHaveLength(10)
      expect(progressUpdates[0]).toEqual({ index: 1, total: 10 })
      expect(progressUpdates[9]).toEqual({ index: 10, total: 10 })
    })

    test('应该正确处理关卡转换', () => {
      const gameStartEvents: Array<{ level: number }> = []
      const gameEndEvents: any[] = []

      on('game:start', (data) => {
        gameStartEvents.push(data)
      })

      on('game:end', (data) => {
        gameEndEvents.push(data)
      })

      // 开始第一关
      emit('game:start', { level: 1 })

      // 模拟游戏结束，成功通过
      const summary = {
        correctCount: 8,
        totalCount: 10,
        totalTimeMs: 45000,
        averageTimeMs: 4500,
        comboMax: 3,
        toolsUsed: 1,
        accuracy: 0.8,
        grade: 'A' as const,
        pass: true,
        level: 1
      }
      emit('game:end', { summary })

      // 应该自动开始下一关
      const nextLevelValue = nextLevel(1, true)
      emit('game:start', { level: nextLevelValue })

      expect(gameStartEvents).toHaveLength(2)
      expect(gameStartEvents[0]).toEqual({ level: 1 })
      expect(gameStartEvents[1]).toEqual({ level: 2 })
      expect(gameEndEvents).toHaveLength(1)
    })
  })

  describe('UI与游戏逻辑交互', () => {
    test('应该正确处理用户输入反馈', () => {
      const feedbackEvents: Array<{ type: string }> = []
      const choiceEvents: Array<{ choice: boolean }> = []

      on('ui:feedback', (feedback) => {
        feedbackEvents.push(feedback)
      })

      on('ui:choice', (choice) => {
        choiceEvents.push(choice)
      })

      // 模拟用户选择
      emit('ui:choice', { choice: true })
      emit('ui:feedback', { type: 'correct' })

      expect(choiceEvents).toHaveLength(1)
      expect(feedbackEvents).toHaveLength(1)
      expect(choiceEvents[0]).toEqual({ choice: true })
      expect(feedbackEvents[0]).toEqual({ type: 'correct' })
    })

    test('应该正确处理倒计时交互', () => {
      const countdownEvents: string[] = []
      const timerUpdates: number[] = []

      on('ui:countdown:start', (data) => {
        countdownEvents.push('start')
        timerUpdates.push(data.totalMs)
      })

      on('ui:countdown:tick', (data) => {
        countdownEvents.push('tick')
        timerUpdates.push(data.remainingMs)
      })

      on('ui:countdown:extend', (data) => {
        countdownEvents.push('extend')
        timerUpdates.push(data.deltaMs)
      })

      // 模拟倒计时流程
      emit('ui:countdown:start', { totalMs: 30000 })
      emit('ui:countdown:tick', { remainingMs: 25000 })
      emit('ui:countdown:extend', { deltaMs: 5000 })

      expect(countdownEvents).toEqual(['start', 'tick', 'extend'])
      expect(timerUpdates).toEqual([30000, 25000, 5000])
    })

    test('应该正确处理工具使用后的状态更新', () => {
      const toolUseEvents: Array<{ type: string }> = []
      const toolUpdateEvents: Array<{ magnify: number; watch: number; flash: number }> = []

      on('tool:use', (data) => {
        toolUseEvents.push(data)
      })

      on('tool:update', (data) => {
        toolUpdateEvents.push(data)
      })

      // 模拟工具使用
      emit('tool:use', { type: 'magnify' })
      emit('tool:update', { magnify: 2, watch: 3, flash: 1 })

      expect(toolUseEvents).toHaveLength(1)
      expect(toolUpdateEvents).toHaveLength(1)
      expect(toolUseEvents[0]).toEqual({ type: 'magnify' })
      expect(toolUpdateEvents[0]).toEqual({ magnify: 2, watch: 3, flash: 1 })
    })
  })

  describe('游戏流程集成', () => {
    test('应该正确集成游戏流程逻辑', () => {
      // 测试通过判断
      expect(isPass(0.8)).toBe(true)
      expect(isPass(0.79)).toBe(false)

      // 测试关卡逻辑
      expect(nextLevel(1, true)).toBe(2)
      expect(nextLevel(5, false)).toBe(5)

      // 测试结果标签
      expect(resultPrimaryActionLabel(true)).toBe('下个案件')
      expect(resultPrimaryActionLabel(false)).toBe('重新分析此案件')
    })

    test('应该正确集成评分系统', () => {
      const gradeEvents: Array<{ accuracy: number; toolsUsed: number; grade: string }> = []

      // 模拟评分计算
      const testCases = [
        { accuracy: 0.95, toolsUsed: 0, expectedGrade: 'S' },
        { accuracy: 0.85, toolsUsed: 1, expectedGrade: 'A' },
        { accuracy: 0.70, toolsUsed: 2, expectedGrade: 'B' },
        { accuracy: 0.50, toolsUsed: 3, expectedGrade: 'C' }
      ]

      testCases.forEach(({ accuracy, toolsUsed, expectedGrade }) => {
        const actualGrade = gradeByAccuracy(accuracy, toolsUsed)
        gradeEvents.push({ accuracy, toolsUsed, grade: actualGrade })
        expect(actualGrade).toBe(expectedGrade)
      })

      expect(gradeEvents).toHaveLength(4)
    })

    test('应该正确处理完整的游戏生命周期', () => {
      const lifecycleEvents: string[] = []

      on('game:start', () => lifecycleEvents.push('start'))
      on('question:new', () => lifecycleEvents.push('question'))
      on('question:answer', () => lifecycleEvents.push('answer'))
      on('game:end', () => lifecycleEvents.push('end'))

      // 模拟完整的游戏生命周期
      emit('game:start', { level: 1 })
      emit('question:new', { question: {} as any })
      emit('question:answer', { isCorrect: true, timeMs: 3000 })
      emit('game:end', { summary: {} as any })

      expect(lifecycleEvents).toEqual(['start', 'question', 'answer', 'end'])
    })
  })

  describe('错误处理和边界情况', () => {
    test('应该正确处理无效的事件数据', () => {
      const errorHandler = jest.fn()

      on('ui:choice', errorHandler)
      on('tool:use', errorHandler)

      // 发送有效事件
      emit('ui:choice', { choice: true })
      emit('tool:use', { type: 'magnify' })

      expect(errorHandler).toHaveBeenCalledTimes(2)
      expect(errorHandler).toHaveBeenCalledWith({ choice: true })
      expect(errorHandler).toHaveBeenCalledWith({ type: 'magnify' })
    })

    test('应该正确处理事件监听器移除', () => {
      const handler = jest.fn()

      on('ui:pause', handler)
      emit('ui:pause', undefined)

      expect(handler).toHaveBeenCalledTimes(1)

      off('ui:pause', handler)
      emit('ui:pause', undefined)

      expect(handler).toHaveBeenCalledTimes(1) // 不应该再次调用
    })

    test('应该正确处理多个事件监听器的清理', () => {
      const handlers = Array(5).fill(null).map(() => jest.fn())

      // 注册多个监听器
      handlers.forEach(handler => {
        on('ui:feedback', handler)
      })

      emit('ui:feedback', { type: 'correct' })

      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledWith({ type: 'correct' })
      })

      // 移除所有监听器
      handlers.forEach(handler => {
        off('ui:feedback', handler)
      })

      // 重置mock
      handlers.forEach(handler => handler.mockClear())

      emit('ui:feedback', { type: 'wrong' })

      handlers.forEach(handler => {
        expect(handler).not.toHaveBeenCalled()
      })
    })
  })
})