export interface ButtonStyleConfig {
  readonly minWidth: number
  readonly minHeight: number
  readonly paddingX: number
  readonly paddingY: number
  readonly fontSize: number
  readonly backgroundColor: string
  readonly textColor: string
  readonly verticalOffset?: number
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
  readonly textColor: string
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
    paddingY: 10,
    fontSize: 24,
    backgroundColor: '#2de1c2',
    textColor: '#0b1021',
    verticalOffset: -4,
  },
  primaryButton: {
    minWidth: 160,
    minHeight: 52,
    paddingX: 22,
    paddingY: 10,
    fontSize: 24,
    backgroundColor: '#2de1c2',
    textColor: '#0b1021',
    verticalOffset: -4,
  },
  secondaryButton: {
    minWidth: 140,
    minHeight: 52,
    paddingX: 18,
    paddingY: 10,
    fontSize: 22,
    backgroundColor: '#a9ffea',
    textColor: '#0b1021',
    verticalOffset: -4,
  },
  toolDisplay: {
    headerIconSize: 32,
    headerFontSize: 18,
    headerSpacing: 60,
    footerIconSize: 80,
  },
  pauseButton: {
    fontSize: 36,
    marginRight: 18,
    marginTop: 12,
    textColor: '#ffffff',
  },
}

export type UiConfigKey = keyof UiConfig

export const getUiConfig = <K extends UiConfigKey>(key: K): UiConfig[K] => uiConfig[key]

