/**
 * 展示类型配置
 * 与后端模型 pageComponentModel.js 中的 displayType 枚举保持一致
 */

// 展示类型枚举（与后端一致）
export const DISPLAY_TYPES = {
  CAROUSEL: 'carousel',
  GRID: 'grid',
  LIST: 'list',
  SCROLL_SNAP: 'scroll-snap',
  SEAMLESS: 'seamless',
  VIDEO: 'video'
}

// 展示类型配置映射
export const DISPLAY_TYPE_CONFIG = {
  [DISPLAY_TYPES.CAROUSEL]: {
    label: '轮播图',
    tagType: 'primary',
    component: 'ImageCarousel'
  },
  [DISPLAY_TYPES.GRID]: {
    label: '网格',
    tagType: 'success',
    component: 'Desccard'
  },
  [DISPLAY_TYPES.LIST]: {
    label: '列表',
    tagType: 'info',
    component: 'Bigner'
  },
  [DISPLAY_TYPES.SCROLL_SNAP]: {
    label: '滚动快照',
    tagType: 'warning',
    component: 'ScrollSnapCarousel'
  },
  [DISPLAY_TYPES.SEAMLESS]: {
    label: '无缝滚动',
    tagType: 'danger',
    component: 'SeamlessCarousel'
  },
  [DISPLAY_TYPES.VIDEO]: {
    label: '视频播放器',
    tagType: 'primary',
    component: 'VideoPlayer'
  }
}

// 获取所有展示类型值（用于验证）
export const DISPLAY_TYPE_VALUES = Object.values(DISPLAY_TYPES)

/**
 * 获取展示类型的标签文本
 * @param {string} type - 展示类型
 * @returns {string} 标签文本
 */
export function getDisplayTypeLabel(type) {
  return DISPLAY_TYPE_CONFIG[type]?.label || type || ''
}

/**
 * 获取展示类型的标签类型（用于 el-tag）
 * @param {string} type - 展示类型
 * @returns {string} 标签类型（primary/success/info/warning/danger）
 */
export function getDisplayTypeTagType(type) {
  return DISPLAY_TYPE_CONFIG[type]?.tagType || ''
}

/**
 * 获取展示类型的组件名称
 * @param {string} type - 展示类型
 * @returns {string} 组件名称
 */
export function getDisplayTypeComponent(type) {
  return DISPLAY_TYPE_CONFIG[type]?.component || ''
}

/**
 * 获取展示类型的完整配置
 * @param {string} type - 展示类型
 * @returns {Object|null} 配置对象
 */
export function getDisplayTypeConfig(type) {
  return DISPLAY_TYPE_CONFIG[type] || null
}

/**
 * 获取所有展示类型的选项（用于 el-select）
 * @returns {Array} 选项数组 [{label: string, value: string}]
 */
export function getDisplayTypeOptions() {
  return DISPLAY_TYPE_VALUES.map(type => ({
    label: getDisplayTypeLabel(type),
    value: type
  }))
}

/**
 * 验证展示类型是否有效
 * @param {string} type - 展示类型
 * @returns {boolean} 是否有效
 */
export function isValidDisplayType(type) {
  return DISPLAY_TYPE_VALUES.includes(type)
}

/**
 * 默认展示类型
 */
export const DEFAULT_DISPLAY_TYPE = DISPLAY_TYPES.CAROUSEL
