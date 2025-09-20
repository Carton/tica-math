type Handler = (payload: any) => void

class SimpleEventBus {
  private map = new Map<string, Set<Handler>>()

  emit(event: string, payload: any) {
    const set = this.map.get(event)
    if (!set) return
    for (const fn of Array.from(set)) {
      try { fn(payload) } catch { /* noop */ }
    }
  }

  on(event: string, handler: Handler) {
    let set = this.map.get(event)
    if (!set) { set = new Set(); this.map.set(event, set) }
    set.add(handler)
  }

  off(event: string, handler: Handler) {
    const set = this.map.get(event)
    if (!set) return
    set.delete(handler)
    if (set.size === 0) this.map.delete(event)
  }
}

export const EventBus = new SimpleEventBus()

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
  'ui:pause': void
  'ui:resume': void
  'tool:use': { type: 'magnify' | 'watch' | 'flash' }
  'tool:update': { magnify: number; watch: number; flash: number }
  'tool:hints': { targetSkills: string[]; hint: string }
  'progress:update': { index: number; total: number }
  'audio:play': { key: string }
}

export function emit<K extends keyof EventPayloads>(key: K, payload: EventPayloads[K]) {
  EventBus.emit(key as string, payload as any)
}

export function on<K extends keyof EventPayloads>(key: K, cb: (payload: EventPayloads[K]) => void, _ctx?: any) {
  EventBus.on(key as string, cb as any)
}

export function off<K extends keyof EventPayloads>(key: K, cb: (payload: EventPayloads[K]) => void, _ctx?: any) {
  EventBus.off(key as string, cb as any)
}
