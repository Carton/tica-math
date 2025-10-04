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
  readonly headerIconLabelGap: number
  readonly footerIconSize: number
}

/** 右上角区域配置接口 */
export interface HeaderAreaConfig {
  /** 右上角整体布局配置 */
  readonly layout: {
    /** 右上角元素的Y坐标基准位置 */
    readonly baseY: number
    /** 暂停按钮的X坐标（距屏幕右边缘的距离） */
    readonly pauseButtonMarginRight: number
    /** 暂停按钮的Y坐标（距屏幕顶部的距离） */
    readonly pauseButtonMarginTop: number
    /** 倒计时文本与暂停按钮的间距 */
    readonly countdownSpacing: number
    /** 工具显示区域与倒计时文本的间距 */
    readonly toolDisplaySpacing: number
  }
  /** 右上角文本样式配置 */
  readonly textStyles: {
    /** 暂停按钮字体大小 */
    readonly pauseButtonFontSize: string
    /** 倒计时文本字体大小 */
    readonly countdownFontSize: string
    /** 倒计时文本颜色 */
    readonly countdownColor: string
    /** 道具数量文本字体大小 */
    readonly toolCountFontSize: string
    /** 道具数量文本颜色 */
    readonly toolCountColor: string
  }
  /** 右上角道具显示配置 */
  readonly tools: {
    /** 道具图标大小 */
    readonly iconSize: number
    /** 道具数量文本字体大小 */
    readonly fontSize: number
    /** 道具数量文本颜色 */
    readonly fontColor: string
    /** 道具图标与数量文字的间距 */
    readonly iconLabelGap: number
    /** 各个道具之间的间距 */
    readonly spacing: number
  }
}

export interface UiConfig {
  readonly primaryButton: ButtonStyleConfig
  readonly secondaryButton: ButtonStyleConfig
  readonly toolDisplay: ToolDisplayConfig
  readonly headerArea: HeaderAreaConfig
}

export const uiConfig: UiConfig = {
  primaryButton: {
    minWidth: 160,
    minHeight: 52,
    paddingX: 8, // 减少左右padding
    paddingY: 6,  // 减少上下padding
    fontSize: 24,
    backgroundColor: '#2de1c2',
    textColor: '#0b1021',
    verticalOffset: -4, // 向上偏移2像素来修复文字偏下问题
  },
  secondaryButton: {
    minWidth: 140,
    minHeight: 52,
    paddingX: 8, // 减少左右padding
    paddingY: 6,  // 减少上下padding
    fontSize: 22,
    backgroundColor: '#a9ffea',
    textColor: '#0b1021',
    verticalOffset: -4, // 向上偏移2像素来修复文字偏下问题
  },
  toolDisplay: {
    headerIconSize: 32,
    headerFontSize: 18,
    headerSpacing: 60,
    headerIconLabelGap: 4,
    footerIconSize: 80,
  },
  headerArea: {
    /** 右上角布局配置 - 基于当前UIScene中的实际值 */
    layout: {
      /** 右上角元素的Y坐标基准位置 - 对应代码中的 headerY */
      baseY: 40,
      /** 暂停按钮距屏幕右边缘的距离 - 对应 pauseButtonX = width - pauseButtonMarginRight */
      pauseButtonMarginRight: 10,
      /** 暂停按钮距屏幕顶部的距离 - 对应 pauseButtonY = 16 */
      pauseButtonMarginTop: 20,
      /** 倒计时文本与暂停按钮的间距 - 对应 countdownX = pauseButtonX - 40 */
      countdownSpacing: 40,
      /** 工具显示区域与倒计时文本的间距 - 对应 toolDisplayX = countdownX - 200 */
      toolDisplaySpacing: 290,
    },
    /** 右上角文本样式配置 - 基于当前代码中的样式值 */
    textStyles: {
      /** 暂停按钮字体大小 */
      pauseButtonFontSize: '35px',
      /** 倒计时文本字体大小 - 对应代码中的 '24px' */
      countdownFontSize: '24px',
      /** 倒计时文本颜色 - 对应代码中的 '#ffd166' */
      countdownColor: '#ffd166',
      /** 道具数量文本字体大小 - 对应代码中的 '20px' */
      toolCountFontSize: '22px',
      /** 道具数量文本颜色 - 对应代码中的 '#a9ffea' */
      toolCountColor: '#a9ffea',
    },
    /** 右上角道具显示配置 - 整合当前道具相关的配置值 */
    tools: {
      /** 道具图标大小 - 对应 toolDisplay.headerIconSize */
      iconSize: 32,
      /** 道具数量文本字体大小 - 对应 toolDisplay.headerFontSize */
      fontSize: 20,
      /** 道具数量文本颜色 - 对应 textStyles.toolCountColor */
      fontColor: '#a9ffea',
      /** 道具图标与数量文字的间距 - 对应 toolDisplay.headerIconLabelGap */
      iconLabelGap: 0,
      /** 各个道具之间的间距 - 对应代码中的 pairSpacing = 75 */
      spacing: 75,
    },
  },
}

export type UiConfigKey = keyof UiConfig

export const getUiConfig = <K extends UiConfigKey>(key: K): UiConfig[K] => uiConfig[key]

