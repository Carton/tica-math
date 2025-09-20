export interface GameAssets {
  // Background assets
  backgrounds: {
    main: string
    questionNote: string
    button: string
    pauseOverlay: string
  }

  // Character assets
  character: {
    tica: {
      idle: string
      thinking: string
      happy: string
      surprised: string
    }
  }

  // UI assets
  ui: {
    buttons: {
      trueButton: string
      falseButton: string
      pauseButton: string
      menuButton: string
    }
    tools: {
      magnify: string
      timeSlow: string
      insight: string
    }
    icons: {
      timer: string
      progress: string
      clue: string
    }
  }

  // Audio assets
  audio: {
    background: string
    effects: {
      correct: string
      wrong: string
      toolUse: string
      pause: string
      buttonClick: string
    }
  }

  // Animation assets
  animations: {
    feedback: {
      correct: string
      wrong: string
    }
    tools: {
      magnify: string
      timeSlow: string
      insight: string
    }
  }
}

export const DEFAULT_ASSETS: GameAssets = {
  backgrounds: {
    main: 'assets/backgrounds/main-bg.png',
    questionNote: 'assets/backgrounds/question-note.png',
    button: 'assets/ui/button-bg.png',
    pauseOverlay: 'assets/ui/pause-overlay.png'
  },

  character: {
    tica: {
      idle: 'assets/characters/tica-idle.png',
      thinking: 'assets/characters/tica-thinking.png',
      happy: 'assets/characters/tica-happy.png',
      surprised: 'assets/characters/tica-surprised.png'
    }
  },

  ui: {
    buttons: {
      trueButton: 'assets/ui/buttons/true-btn.png',
      falseButton: 'assets/ui/buttons/false-btn.png',
      pauseButton: 'assets/ui/buttons/pause-btn.png',
      menuButton: 'assets/ui/buttons/menu-btn.png'
    },
    tools: {
      magnify: 'assets/ui/tools/magnify.png',
      timeSlow: 'assets/ui/tools/time-slow.png',
      insight: 'assets/ui/tools/insight.png'
    },
    icons: {
      timer: 'assets/ui/icons/timer.png',
      progress: 'assets/ui/icons/progress.png',
      clue: 'assets/ui/icons/clue.png'
    }
  },

  audio: {
    background: 'assets/audio/background-music.mp3',
    effects: {
      correct: 'assets/audio/correct.mp3',
      wrong: 'assets/audio/wrong.mp3',
      toolUse: 'assets/audio/tool-use.mp3',
      pause: 'assets/audio/pause.mp3',
      buttonClick: 'assets/audio/button-click.mp3'
    }
  },

  animations: {
    feedback: {
      correct: 'assets/animations/correct-feedback.png',
      wrong: 'assets/animations/wrong-feedback.png'
    },
    tools: {
      magnify: 'assets/animations/magnify-tool.png',
      timeSlow: 'assets/animations/time-slow-tool.png',
      insight: 'assets/animations/insight-tool.png'
    }
  }
}

export interface AssetConfig {
  assets: GameAssets
  loadingScreen: {
    showProgressBar: boolean
    backgroundImage: string
    loadingText: string
  }
  optimization: {
    useWebP: boolean
    compressTextures: boolean
    cacheSize: number
  }
}

export const DEFAULT_ASSET_CONFIG: AssetConfig = {
  assets: DEFAULT_ASSETS,
  loadingScreen: {
    showProgressBar: true,
    backgroundImage: 'assets/ui/loading-bg.png',
    loadingText: '正在加载游戏...'
  },
  optimization: {
    useWebP: true,
    compressTextures: true,
    cacheSize: 100 // MB
  }
}