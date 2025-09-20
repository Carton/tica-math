import Phaser from 'phaser'

class GlobalEventBus extends Phaser.Events.EventEmitter {}

export const EventBus = new GlobalEventBus()

export type EventPayloads = {
  'boot:ready': void
  'game:start': { level: number }
  'game:end': { summary: unknown }
  'question:new': { question: unknown }
  'question:answer': { isCorrect: boolean; timeMs: number }
  'question:timeout': void
  'ui:countdown:start': { totalMs: number }
  'ui:countdown:tick': { remainingMs: number }
  'ui:countdown:extend': { deltaMs: number }
  'ui:feedback': { type: 'correct' | 'wrong' | 'timeout' | 'combo' | 'speed' }
  'ui:choice': { choice: boolean }
  'tool:use': { type: 'magnify' | 'watch' | 'flash' }
  'tool:hints': { targetSkills: string[]; hint: string }
  'progress:update': { index: number; total: number }
  'audio:play': { key: string }
}

export function emit<K extends keyof EventPayloads>(key: K, payload: EventPayloads[K]) {
  EventBus.emit(key as string, payload as any)
}

export function on<K extends keyof EventPayloads>(key: K, cb: (payload: EventPayloads[K]) => void, ctx?: any) {
  EventBus.on(key as string, cb as any, ctx)
}

export function off<K extends keyof EventPayloads>(key: K, cb: (payload: EventPayloads[K]) => void, ctx?: any) {
  EventBus.off(key as string, cb as any, ctx)
}
