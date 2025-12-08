import { computed } from 'vue'
import { DISPLAY_TYPES } from '@/config/displayType'

/**
 * Fisher-Yates 洗牌算法，用于随机排列数组
 * @param {Array} array - 要洗牌的数组
 * @returns {Array} 洗牌后的新数组
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 获取组件的数据项（映射为组件需要的格式）
 * 支持 item 级别和 component 级别的 link
 * @param {Object} component - 组件对象
 * @returns {Array} 处理后的数据项数组
 */
export function getComponentItemsData(component) {
  if (!component || !component.items || !Array.isArray(component.items)) {
    return []
  }

  // 获取组件级别的 link（如果 item 没有自己的 link，可以使用组件级别的 link）
  const componentLink =
    component?.link && typeof component.link === 'string' && component.link.trim()
      ? component.link.trim()
      : ''

  const items = component.items.map(item => {
    // 保持 item.link 的原始值，不在这里做 fallback
    // 跳转优先级逻辑由 linkHandler.js 的 handleItemClick 函数处理
    const itemLink =
      item?.link && typeof item.link === 'string' && item.link.trim() ? item.link.trim() : ''

    return {
      url: item?.media?.url || '',
      originalName: item?.media?.filename || '',
      name: item?.media?.filename || '',
      // 确保 descriptions 是数组格式，兼容后端返回的数据结构
      des: Array.isArray(item?.descriptions)
        ? item.descriptions.map(desc => (typeof desc === 'string' ? { text: desc } : desc))
        : [],
      descriptions: Array.isArray(item?.descriptions)
        ? item.descriptions.map(desc => (typeof desc === 'string' ? { text: desc } : desc))
        : [],
      type: item?.media?.type || 'image', // 使用后端返回的 type
      fileType: item?.media?.type || 'image',
      // item 级别的 link（保持原始值，跳转时由 linkHandler 处理优先级）
      link: itemLink,
      media: {
        url: item?.media?.url || '',
        type: item?.media?.type || 'image',
        filename: item?.media?.filename || ''
      }
    }
  })

  // 随机排列 items
  return shuffleArray(items)
}

/**
 * 获取视频源地址（取第一个视频项）
 * @param {Object} component - 组件对象
 * @returns {string} 视频源地址
 */
export function getVideoSrc(component) {
  if (!component || !component.items || !Array.isArray(component.items)) return ''
  const videoItem = component.items.find(item => item?.media?.type === 'video')
  return videoItem?.media?.url || component.items[0]?.media?.url || ''
}

/**
 * 获取视频高度
 * @param {Object} component - 组件对象
 * @returns {string} 视频高度
 */
export function getVideoHeight(component) {
  return '100%'
}

/**
 * 获取视频文字（从 descriptions 中获取）
 * @param {Object} component - 组件对象
 * @returns {string} 视频文字
 */
export function getVideoText(component) {
  if (!component || !component.items || !Array.isArray(component.items)) return ''
  const firstItem = component.items[0]
  if (
    firstItem?.descriptions &&
    Array.isArray(firstItem.descriptions) &&
    firstItem.descriptions.length > 0
  ) {
    return firstItem.descriptions[0]?.text || ''
  }
  return ''
}

/**
 * 获取视频是否显示控件
 * @param {Object} component - 组件对象
 * @returns {boolean} 是否显示控件
 */
export function getVideoShowControls(component) {
  return true
}

/**
 * 获取视频是否静音
 * @param {Object} component - 组件对象
 * @returns {boolean} 是否静音
 */
export function getVideoMuted(component) {
  return true
}

/**
 * 获取视频是否循环
 * @param {Object} component - 组件对象
 * @returns {boolean} 是否循环
 */
export function getVideoLoop(component) {
  return true
}

/**
 * 获取视频是否自动播放
 * @param {Object} component - 组件对象
 * @returns {boolean} 是否自动播放
 */
export function getVideoAutoplay(component) {
  return true
}

/**
 * 获取滚动快照的高度
 * @param {Object} component - 组件对象
 * @returns {number} 高度值
 */
export function getScrollSnapHeight(component) {
  return 640
}

/**
 * 获取滚动快照的宽度模式
 * @param {Object} component - 组件对象
 * @returns {string} 宽度模式 ('wide' 或 'narrow')
 */
export function getScrollSnapWidthMode(component) {
  return component?.widthMode || component?.config?.widthMode || 'wide'
}

/**
 * 组件过滤器 Composable
 * 根据 componentsList 返回排序和过滤后的组件
 * @param {import('vue').Ref<Array>} componentsList - 组件列表的响应式引用
 * @returns {Object} 包含排序和过滤后的组件的对象
 */
export function useComponentFilters(componentsList) {
  // 按 order 排序后的组件列表
  const sortedComponents = computed(() => {
    return [...componentsList.value].sort((a, b) => {
      const orderA = a.order ?? 0
      const orderB = b.order ?? 0
      return orderA - orderB
    })
  })

  // 头部组件
  const headerComponents = computed(() =>
    sortedComponents.value.filter(
      component => component.displayType === DISPLAY_TYPES.HEADER && component.isActive
    )
  )

  // 底部组件
  const footerComponents = computed(() =>
    sortedComponents.value.filter(
      component => component.displayType === DISPLAY_TYPES.FOOTER && component.isActive
    )
  )

  // 内容组件（排除 header 和 footer）
  const contentComponents = computed(() =>
    sortedComponents.value.filter(
      component =>
        ![DISPLAY_TYPES.HEADER, DISPLAY_TYPES.FOOTER].includes(component.displayType) &&
        component.isActive
    )
  )

  return {
    sortedComponents,
    headerComponents,
    footerComponents,
    contentComponents
  }
}

/**
 * 页面组件 Composable
 * 提供所有页面组件相关的工具函数和计算属性
 * @param {import('vue').Ref<Array>} componentsList - 组件列表的响应式引用
 * @returns {Object} 包含所有工具函数和计算属性的对象
 */
export function usePageComponents(componentsList) {
  const filters = useComponentFilters(componentsList)

  return {
    // 工具函数
    shuffleArray,
    getComponentItemsData,
    getVideoSrc,
    getVideoHeight,
    getVideoText,
    getVideoShowControls,
    getVideoMuted,
    getVideoLoop,
    getVideoAutoplay,
    getScrollSnapHeight,
    getScrollSnapWidthMode,
    // 计算属性
    ...filters
  }
}
