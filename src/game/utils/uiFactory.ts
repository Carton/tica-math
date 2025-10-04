import type Phaser from 'phaser'
import { getUiConfig } from '@/game/config/uiConfig'

interface ButtonOptions {
  text?: string
  configKey?: 'button' | 'primaryButton' | 'secondaryButton'
  width?: number
  onClick?: () => void
  backgroundColor?: string
  textColor?: string
  fontSize?: number
  verticalOffset?: number
}

const defaultFontFamily = 'sans-serif'

export const createTextButton = (scene: Phaser.Scene, x: number, y: number, options: ButtonOptions) => {
  const { text = '', onClick, configKey = 'button', width, backgroundColor, textColor, fontSize, verticalOffset = 0 } = options
  const cfg = getUiConfig(configKey)

  const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: defaultFontFamily,
    fontSize: `${fontSize ?? cfg.fontSize}px`,
    color: textColor ?? cfg.textColor,
    backgroundColor: backgroundColor ?? cfg.backgroundColor,
    padding: { x: cfg.paddingX, y: cfg.paddingY },
    align: 'center',
  }

  const button = scene.add.text(x, y, text, textStyle).setOrigin(0.5)
  if (verticalOffset !== 0) {
    button.setPosition(x, y + verticalOffset)
  }
  button.setFixedSize(width ?? cfg.minWidth, cfg.minHeight)
  button.setInteractive({ useHandCursor: true })

  if (onClick) button.on('pointerup', onClick)

  return button
}

export const applyTextButtonStyle = (textObj: Phaser.GameObjects.Text, configKey: 'button' | 'primaryButton' | 'secondaryButton') => {
  const cfg = getUiConfig(configKey)
  textObj.setPadding(cfg.paddingX, cfg.paddingY)
  textObj.setFontSize(cfg.fontSize)
  textObj.setFontFamily(defaultFontFamily)
  textObj.setColor('#0b1021')
  textObj.setBackgroundColor(cfg.backgroundColor)
  textObj.setFixedSize(cfg.minWidth, cfg.minHeight)
  return textObj
}

