import { emit, on } from '@/game/managers/EventBus'

test('pause and resume events flow', () => {
  const calls: string[] = []
  on('ui:pause', () => calls.push('pause'))
  on('ui:resume', () => calls.push('resume'))

  emit('ui:pause', undefined as any)
  emit('ui:resume', undefined as any)

  expect(calls).toEqual(['pause', 'resume'])
})
