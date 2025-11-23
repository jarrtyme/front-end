import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

// 根据屏幕宽度计算缩放比例
export const useSrcean = (contentWidth = 768) => {
  const { width } = useWindowSize()

  const scale = computed(() => {
    if (width.value < contentWidth) {
      return width.value / contentWidth
    }
    return 1
  })

  return {
    scale
  }
}
