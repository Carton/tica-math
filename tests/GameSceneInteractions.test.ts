import { emit, on, off } from '@/game/managers/EventBus'
import { EventBus } from '@/game/managers/EventBus'
import { type Question } from '@/game/utils/types'

describe('GameScene Interactions', () => {
  beforeEach(() => {
    // 清理事件监听器
    ;(EventBus as any).map.clear()
  })

  describe('游戏流程事件', () => {
    test('应该正确处理游戏开始事件', () => {
      const gameStartHandler = jest.fn()

      on('game:start', gameStartHandler)
      emit('game:start', { level: 5 })

      expect(gameStartHandler).toHaveBeenCalledWith({ level: 5 })
    })

    test('应该正确处理问题新事件', () => {
      const questionNewHandler = jest.fn()
      const mockQuestion: Question = {
        questionString: '2 + 2 = 4',
        isTrue: true,
        targetSkills: ['estimate'],
        digitDifficulty: 2,
        metadata: { expr: '2+2', correctValue: 4, shownValue: 4 }
      }

      on('question:new', questionNewHandler)
      emit('question:new', { question: mockQuestion })

      expect(questionNewHandler).toHaveBeenCalledWith({ question: mockQuestion })
    })

    test('应该正确处理问题回答事件', () => {
      const answerHandler = jest.fn()

      on('question:answer', answerHandler)
      emit('question:answer', { isCorrect: true, timeMs: 5000 })

      expect(answerHandler).toHaveBeenCalledWith({ isCorrect: true, timeMs: 5000 })
    })

    test('应该正确处理超时事件', () => {
      const timeoutHandler = jest.fn()

      on('question:timeout', timeoutHandler)
      emit('question:timeout', undefined)

      expect(timeoutHandler).toHaveBeenCalledWith(undefined)
    })
  })

  describe('UI交互事件', () => {
    test('应该正确处理用户选择事件', () => {
      const choiceHandler = jest.fn()

      on('ui:choice', choiceHandler)
      emit('ui:choice', { choice: true })

      expect(choiceHandler).toHaveBeenCalledWith({ choice: true })
    })

    test('应该正确处理暂停和恢复事件', () => {
      const pauseHandler = jest.fn()
      const resumeHandler = jest.fn()

      on('ui:pause', pauseHandler)
      on('ui:resume', resumeHandler)

      emit('ui:pause', undefined)
      emit('ui:resume', undefined)

      expect(pauseHandler).toHaveBeenCalledWith(undefined)
      expect(resumeHandler).toHaveBeenCalledWith(undefined)
    })

    test('应该正确处理倒计时相关事件', () => {
      const startHandler = jest.fn()
      const tickHandler = jest.fn()
      const extendHandler = jest.fn()

      on('ui:countdown:start', startHandler)
      on('ui:countdown:tick', tickHandler)
      on('ui:countdown:extend', extendHandler)

      emit('ui:countdown:start', { totalMs: 30000 })
      emit('ui:countdown:tick', { remainingMs: 25000 })
      emit('ui:countdown:extend', { deltaMs: 5000 })

      expect(startHandler).toHaveBeenCalledWith({ totalMs: 30000 })
      expect(tickHandler).toHaveBeenCalledWith({ remainingMs: 25000 })
      expect(extendHandler).toHaveBeenCalledWith({ deltaMs: 5000 })
    })

    test('应该正确处理进度更新事件', () => {
      const progressHandler = jest.fn()

      on('progress:update', progressHandler)
      emit('progress:update', { index: 5, total: 10 })

      expect(progressHandler).toHaveBeenCalledWith({ index: 5, total: 10 })
    })
  })

  describe('工具系统事件', () => {
    test('应该正确处理工具使用事件', () => {
      const toolUseHandler = jest.fn()

      on('tool:use', toolUseHandler)
      emit('tool:use', { type: 'magnify' })

      expect(toolUseHandler).toHaveBeenCalledWith({ type: 'magnify' })
    })

    test('应该正确处理所有类型的工具使用', () => {
      const toolUseHandler = jest.fn()

      on('tool:use', toolUseHandler)

      const toolTypes = ['magnify', 'watch', 'light'] as const
      toolTypes.forEach(toolType => {
        emit('tool:use', { type: toolType })
      })

      expect(toolUseHandler).toHaveBeenCalledTimes(3)
      expect(toolUseHandler).toHaveBeenCalledWith({ type: 'magnify' })
      expect(toolUseHandler).toHaveBeenCalledWith({ type: 'watch' })
      expect(toolUseHandler).toHaveBeenCalledWith({ type: 'light' })
    })

    test('应该正确处理工具更新事件', () => {
      const toolUpdateHandler = jest.fn()

      on('tool:update', toolUpdateHandler)
      emit('tool:update', { magnify: 2, watch: 1, light: 0 })

      expect(toolUpdateHandler).toHaveBeenCalledWith({ magnify: 2, watch: 1, light: 0 })
    })

    test('应该正确处理工具提示事件', () => {
      const toolHintsHandler = jest.fn()

      on('tool:hints', toolHintsHandler)
      emit('tool:hints', {
        targetSkills: ['estimate', 'lastDigit'],
        hint: '别管前面多复杂，先看尾巴抓一抓！'
      })

      expect(toolHintsHandler).toHaveBeenCalledWith({
        targetSkills: ['estimate', 'lastDigit'],
        hint: '别管前面多复杂，先看尾巴抓一抓！'
      })
    })
  })

  describe('反馈系统事件', () => {
    test('应该正确处理所有类型的反馈事件', () => {
      const feedbackHandler = jest.fn()

      on('ui:feedback', feedbackHandler)

      const feedbackTypes = ['correct', 'wrong', 'timeout', 'combo', 'speed'] as const
      feedbackTypes.forEach(feedbackType => {
        emit('ui:feedback', { type: feedbackType })
      })

      expect(feedbackHandler).toHaveBeenCalledTimes(5)
      feedbackTypes.forEach(feedbackType => {
        expect(feedbackHandler).toHaveBeenCalledWith({ type: feedbackType })
      })
    })

    test('应该正确处理音频播放事件', () => {
      const audioHandler = jest.fn()

      on('audio:play', audioHandler)
      emit('audio:play', { key: 'correct_sound' })

      expect(audioHandler).toHaveBeenCalledWith({ key: 'correct_sound' })
    })
  })

  describe('游戏结束事件', () => {
    test('应该正确处理游戏结束事件', () => {
      const gameEndHandler = jest.fn()
      const mockSummary = {
        correctCount: 8,
        totalCount: 10,
        totalTimeMs: 45000,
        averageTimeMs: 4500,
        comboMax: 3,
        toolsUsed: 1,
        accuracy: 0.8,
        grade: 'A' as const,
        pass: true,
        level: 5
      }

      on('game:end', gameEndHandler)
      emit('game:end', { summary: mockSummary })

      expect(gameEndHandler).toHaveBeenCalledWith({ summary: mockSummary })
    })
  })

  describe('事件类型安全', () => {
    test('应该保证事件类型的类型安全', () => {
      const handler = jest.fn()

      // 编译时类型检查
      on('ui:feedback', handler)
      emit('ui:feedback', { type: 'correct' })

      expect(handler).toHaveBeenCalledWith({ type: 'correct' })

      // 测试其他事件类型
      on('tool:use', handler)
      emit('tool:use', { type: 'magnify' })

      expect(handler).toHaveBeenCalledWith({ type: 'magnify' })
    })
  })
})