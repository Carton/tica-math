import '@testing-library/jest-dom'

// Mock Phaser for testing
jest.mock('phaser', () => ({
  Game: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    registry: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: {
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        destroy: jest.fn()
      }),
      rectangle: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setStrokeStyle: jest.fn().mockReturnThis(),
        setFillStyle: jest.fn().mockReturnThis(),
        setAlpha: jest.fn().mockReturnThis()
      }),
      container: jest.fn().mockReturnValue({
        add: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      })
    },
    scene: {
      start: jest.fn(),
      launch: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn()
    },
    time: {
      addEvent: jest.fn(),
      delayedCall: jest.fn()
    },
    tweens: {
      add: jest.fn()
    },
    cameras: {
      main: {
        width: 1280,
        height: 720
      }
    },
    children: {
      list: []
    },
    load: {
      pack: jest.fn(),
      on: jest.fn()
    },
    registry: {
      get: jest.fn(),
      set: jest.fn()
    },
    game: {
      events: {
        on: jest.fn(),
        emit: jest.fn()
      }
    },
    events: {
      on: jest.fn(),
      emit: jest.fn()
    }
  })),
  AUTO: 'AUTO',
  Scale: {
    FIT: 'FIT',
    CENTER_BOTH: 'CENTER_BOTH'
  }
}))

// Setup global test utilities
;(global as any).describe = describe
;(global as any).it = it
;(global as any).test = test
;(global as any).expect = expect
;(global as any).jest = jest

// Mock window and DOM for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
global.localStorage = localStorageMock