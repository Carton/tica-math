import type Phaser from 'phaser'
import { getUiConfig } from '@/game/config/uiConfig'

type TextStyleOverrides = Partial<Pick<Phaser.Types.GameObjects.Text.TextStyle, 'fontSize' | 'fontFamily' | 'color' | 'backgroundColor'>>

interface ButtonOptions {
  style?: TextStyleOverrides
  text?: string
  configKey?: 'button' | 'primaryButton' | 'secondaryButton'
  width?: number
  onClick?: () => void
  useHandCursor?: boolean
}

const defaultFontFamily = 'sans-serif'

export const createTextButton = (scene: Phaser.Scene, x: number, y: number, options: ButtonOptions) => {
  const { text = '', onClick, configKey = 'button', width, style, useHandCursor = true } = options
  const cfg = getUiConfig(configKey)

  const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: style?.fontFamily ?? defaultFontFamily,
    fontSize: style?.fontSize ?? `${cfg.fontSize}px`,
    color: style?.color ?? '#0b1021',
    backgroundColor: style?.backgroundColor,
    padding: { x: cfg.paddingX, y: cfg.paddingY },
  }

  const button = scene.add.text(x, y, text, textStyle).setOrigin(0.5)

  if (width) {
    button.setFixedSize(width, cfg.minHeight)
  } else {
    button.setFixedSize(cfg.minWidth, cfg.minHeight)
  }

  if (useHandCursor) button.setInteractive({ useHandCursor: true })
  else button.setInteractive()

  if (onClick) button.on('pointerup', onClick)

  return button
}

export const applyTextButtonStyle = (textObj: Phaser.GameObjects.Text, configKey: 'button' | 'primaryButton' | 'secondaryButton') => {
  const cfg = getUiConfig(configKey)
  textObj.setPadding(cfg.paddingX, cfg.paddingY)
  textObj.setFontSize(cfg.fontSize)
  textObj.setFixedSize(cfg.minWidth, cfg.minHeight)
  return textObj
}

