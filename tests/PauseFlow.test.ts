import { emit, on, off } from '@/game/managers/EventBus'

test('pause and resume events flow', () => {
  const calls: string[] = []
  const pauseHandler = () => calls.push('pause')
  const resumeHandler = () => calls.push('resume')
  on('ui:pause', pauseHandler)
  on('ui:resume', resumeHandler)

  emit('ui:pause', undefined as any)
  emit('ui:resume', undefined as any)

  expect(calls).toEqual(['pause', 'resume'])

  off('ui:pause', pauseHandler)
  off('ui:resume', resumeHandler)
})
