export interface ButtonStyleConfig {
  readonly minWidth: number
  readonly minHeight: number
  readonly paddingX: number
  readonly paddingY: number
  readonly fontSize: number
}

export interface ToolDisplayConfig {
  readonly headerIconSize: number
  readonly headerFontSize: number
  readonly headerSpacing: number
  readonly footerIconSize: number
}

export interface PauseButtonConfig {
  readonly fontSize: number
  readonly marginRight: number
  readonly marginTop: number
  readonly bgColor: string
  readonly textColor: string
  readonly paddingX: number
  readonly paddingY: number
}

export interface UiConfig {
  readonly button: ButtonStyleConfig
  readonly primaryButton: ButtonStyleConfig
  readonly secondaryButton: ButtonStyleConfig
  readonly toolDisplay: ToolDisplayConfig
  readonly pauseButton: PauseButtonConfig
}

export const uiConfig: UiConfig = {
  button: {
    minWidth: 140,
    minHeight: 52,
    paddingX: 20,
    paddingY: 12,
    fontSize: 24,
  },
  primaryButton: {
    minWidth: 160,
    minHeight: 56,
    paddingX: 24,
    paddingY: 14,
    fontSize: 26,
  },
  secondaryButton: {
    minWidth: 140,
    minHeight: 52,
    paddingX: 18,
    paddingY: 12,
    fontSize: 22,
  },
  toolDisplay: {
    headerIconSize: 32,
    headerFontSize: 18,
    headerSpacing: 60,
    footerIconSize: 80,
  },
  pauseButton: {
    fontSize: 36,
    marginRight: 28,
    marginTop: 26,
    bgColor: '#2de1c2',
    textColor: '#0b1021',
    paddingX: 14,
    paddingY: 8,
  },
}

export type UiConfigKey = keyof UiConfig

export const getUiConfig = <K extends UiConfigKey>(key: K): UiConfig[K] => uiConfig[key]

