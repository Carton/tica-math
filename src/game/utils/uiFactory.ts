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
}

const defaultFontFamily = 'sans-serif'

export const createTextButton = (scene: Phaser.Scene, x: number, y: number, options: ButtonOptions) => {
  const { text = '', onClick, configKey = 'button', width, backgroundColor, textColor, fontSize } = options
  const cfg = getUiConfig(configKey)

  const button = scene.add.text(x, y, text, {
    fontFamily: defaultFontFamily,
    fontSize: `${fontSize ?? cfg.fontSize}px`,
    color: textColor ?? cfg.textColor,
    backgroundColor: backgroundColor ?? cfg.backgroundColor,
    align: 'center',
  }).setOrigin(0.5)

  const targetWidth = width ?? cfg.minWidth
  const targetHeight = cfg.minHeight
  let currentFontSize = fontSize ?? cfg.fontSize
  const minFontSize = Math.max(12, Math.floor(currentFontSize * 0.6))
  let iterations = 0

  const contentMaxWidth = targetWidth - cfg.paddingX * 2
  const contentMaxHeight = targetHeight - cfg.paddingY * 2

  while ((button.width > contentMaxWidth || button.height > contentMaxHeight) && currentFontSize > minFontSize && iterations < 24) {
    currentFontSize -= 1
    button.setFontSize(currentFontSize)
    iterations += 1
  }

  const extraY = Math.max(0, targetHeight - button.height)
  const paddingTop = cfg.paddingY + extraY / 2
  const paddingBottom = cfg.paddingY + extraY / 2
  button.setPadding(cfg.paddingX, paddingTop, cfg.paddingX, paddingBottom)
  button.setFixedSize(targetWidth, targetHeight)
  button.setInteractive({ useHandCursor: true })

  if (onClick) button.on('pointerup', onClick)

  return button
}

export const applyTextButtonStyle = (textObj: Phaser.GameObjects.Text, configKey: 'button' | 'primaryButton' | 'secondaryButton') => {
  const cfg = getUiConfig(configKey)
  textObj.setFontFamily(defaultFontFamily)
  textObj.setFontSize(cfg.fontSize)
  textObj.setColor(cfg.textColor)
  textObj.setBackgroundColor(cfg.backgroundColor)

  const extraY = Math.max(0, cfg.minHeight - textObj.height)
  const paddingTop = cfg.paddingY + extraY / 2
  const paddingBottom = cfg.paddingY + extraY / 2
  textObj.setPadding(cfg.paddingX, paddingTop, cfg.paddingX, paddingBottom)
  textObj.setFixedSize(cfg.minWidth, cfg.minHeight)
  return textObj
}

