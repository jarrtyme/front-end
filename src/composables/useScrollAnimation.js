import { onMounted, onUnmounted, watch, computed, unref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {Number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 150) {
  let timeout = null
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * 滚动动画 Hook
 * @param {Object} container - 容器元素（触发 ScrollTrigger 的元素）- 传入 ref 对象
 * @param {Object} target - 要动画化的目标元素 - 传入 ref 对象
 * @param {Object} options - 配置选项（可以是响应式对象）
 * @param {String} options.start - ScrollTrigger 开始位置，默认 'top top'
 * @param {String|Number} options.end - ScrollTrigger 结束位置，默认 'bottom top'
 * @param {Boolean} options.pin - 是否吸顶，默认 true
 * @param {Boolean} options.pinSpacing - 是否保留吸顶时的空间，默认 true
 * @param {Boolean|Number} options.scrub - 平滑跟随滚动的延迟（秒），默认 1
 * @param {Number} options.minScale - 最小缩放值，默认 1
 * @param {Number} options.maxScale - 最大缩放值，默认 20
 * @param {Boolean} options.enabled - 是否启用动画，默认 true
 * @returns {Object} 返回控制方法 { init, cleanup, refresh }
 */
export function useScrollAnimation(container, target, options = {}) {
  // 使用 computed 来保持响应式，支持 options 是响应式对象
  const start = computed(() => unref(options.start) ?? 'top top')
  const end = computed(() => unref(options.end) ?? 'bottom top')
  const pin = computed(() => unref(options.pin) ?? true)
  const pinSpacing = computed(() => unref(options.pinSpacing) ?? true)
  const scrub = computed(() => unref(options.scrub) ?? 1)
  const minScale = computed(() => unref(options.minScale) ?? 1)
  const maxScale = computed(() => unref(options.maxScale) ?? 20)
  const enabled = computed(() => unref(options.enabled) ?? true)

  // ScrollTrigger 实例和动画实例
  let scrollTriggerInstance = null
  let animationInstance = null

  // 初始化滚动动画
  const initScrollAnimation = () => {
    if (!enabled.value) {
      cleanup()
      return
    }

    // 获取容器和目标元素的 DOM 节点
    const containerElement = container?.value || container
    const targetElement = target?.value || target

    if (!containerElement || !targetElement) return

    // 清理之前的 ScrollTrigger 和动画
    cleanup()

    // 设置 z-index
    gsap.set(containerElement, { zIndex: 20 })
    gsap.set(targetElement, { zIndex: 21 })

    // 确定动画的起始值和结束值
    // 无论是否写反，起始值都是 minScale，结束值都是 maxScale
    // 如果写反了（maxScale < minScale），动画就是从大值到小值
    const startScale = minScale.value
    const endScale = maxScale.value

    // 设置初始状态
    gsap.set(targetElement, {
      scale: startScale,
      transformOrigin: 'center center'
    })

    // 直接使用 gsap.to 创建动画，让 ScrollTrigger 控制
    animationInstance = gsap.to(targetElement, {
      scale: endScale,
      ease: 'none', // 无缓动，跟随滚动
      paused: true // 暂停动画，由 ScrollTrigger 控制
    })

    // 创建 ScrollTrigger，控制动画
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: containerElement,
      start: start.value,
      end: end.value,
      pin: pin.value,
      pinSpacing: pinSpacing.value,
      scrub: scrub.value,
      animation: animationInstance // 将动画绑定到 ScrollTrigger
    })
  }

  // 清理动画
  const cleanup = () => {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
      scrollTriggerInstance = null
    }
    if (animationInstance) {
      animationInstance.kill()
      animationInstance = null
    }
  }

  // 刷新动画
  const refresh = () => {
    cleanup()
    // 延迟一下确保 DOM 已更新
    setTimeout(() => {
      initScrollAnimation()
    }, 50)
  }

  // 创建防抖的 resize 处理函数
  const debouncedResize = debounce(() => {
    if (enabled.value) {
      refresh()
    }
  }, 150)

  // 监听 container、target 和 enabled 变化，重新初始化
  watch(
    () => [container?.value, target?.value, enabled.value],
    () => {
      cleanup()
      if (enabled.value) {
        setTimeout(() => {
          initScrollAnimation()
        }, 100)
      }
    }
  )

  // 监听 options 的所有属性变化
  watch(
    () => [
      start.value,
      end.value,
      pin.value,
      pinSpacing.value,
      scrub.value,
      minScale.value,
      maxScale.value
    ],
    () => {
      if (enabled.value && scrollTriggerInstance) {
        refresh()
      }
    }
  )

  // 组件挂载后初始化动画
  onMounted(() => {
    if (enabled.value) {
      // 延迟一下确保 DOM 已渲染完成
      setTimeout(() => {
        initScrollAnimation()
        // 窗口大小改变时重新计算（使用防抖）
        window.addEventListener('resize', debouncedResize)
      }, 100)
    }
  })

  // 组件卸载时清理动画
  onUnmounted(() => {
    cleanup()
    window.removeEventListener('resize', debouncedResize)
  })

  // 返回控制方法
  return {
    init: initScrollAnimation,
    cleanup: cleanup,
    refresh: refresh
  }
}
