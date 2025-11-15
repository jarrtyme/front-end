import { onMounted, onUnmounted, watch, computed, unref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

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

  // ScrollTrigger 实例
  let scrollTriggerInstance = null

  // 初始化滚动动画
  const initScrollAnimation = () => {
    if (!enabled.value) return

    // 获取容器和目标元素的 DOM 节点
    const containerElement = container?.value || container
    const targetElement = target?.value || target

    if (!containerElement || !targetElement) return

    // 清理之前的 ScrollTrigger
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
      scrollTriggerInstance = null
    }
    gsap.set(containerElement, { zIndex: 20 })
    gsap.set(targetElement, { zIndex: 21 })

    // 确定动画的起始值和结束值
    // 无论是否写反，起始值都是 minScale，结束值都是 maxScale
    // 如果写反了（maxScale < minScale），动画就是从大值到小值
    const startScale = minScale.value
    const endScale = maxScale.value

    // 立即设置初始状态为动画起始帧，确保页面加载时显示正确
    gsap.set(targetElement, { scale: startScale, transformOrigin: 'center center' })

    // 创建一个虚拟对象来存储缩放值，用于 Timeline 动画
    const scaleObj = { scale: startScale, transformOrigin: 'center center' }

    // 创建 GSAP Timeline
    const tl = gsap.timeline({
      paused: true, // 暂停时间线，由 ScrollTrigger 控制
      defaults: {
        ease: 'none' // 默认无缓动，跟随滚动
      }
    })

    // 在时间线中添加缩放动画
    tl.to(scaleObj, {
      scale: endScale,
      onUpdate: function () {
        // 根据时间线进度更新元素 transform
        const scale = scaleObj.scale
        // 统一使用中心点缩放
        gsap.set(targetElement, {
          scale: scale,
          transformOrigin: 'center center'
        })
      }
    })

    // 立即应用初始状态，确保 timeline 的初始值被正确应用
    tl.progress(0)

    // 创建 ScrollTrigger，控制时间线
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: containerElement,
      start: start.value,
      end: end.value,
      pin: pin.value,
      pinSpacing: pinSpacing.value,
      scrub: scrub.value,
      animation: tl, // 将时间线绑定到 ScrollTrigger
      onEnter: () => {
        // 进入时设置初始状态（动画起始值）
        if (targetElement) {
          gsap.set(targetElement, { scale: startScale, transformOrigin: 'center center' })
        }
      },
      onLeave: () => {
        // 离开时时间线会自动处理
      },
      onEnterBack: () => {
        // 反向进入时时间线会自动处理
      },
      onLeaveBack: () => {
        // 反向离开时时间线会自动处理
      },
      onRefresh: () => {}
    })
  }

  // 清理动画
  const cleanup = () => {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill()
      scrollTriggerInstance = null
    }
  }

  // 刷新动画
  const refresh = () => {
    cleanup()
    initScrollAnimation()
  }

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
    },
    { deep: true }
  )

  // 组件挂载后初始化动画
  onMounted(() => {
    if (enabled.value) {
      // 延迟一下确保 DOM 已渲染完成
      setTimeout(() => {
        initScrollAnimation()
        const targetElement = target?.value || target
        if (targetElement)
          gsap.set(targetElement, { scale: minScale.value, transformOrigin: 'center center' })
        // 窗口大小改变时重新计算
        window.addEventListener('resize', initScrollAnimation)
      })
    }
  })

  // 组件卸载时清理动画
  onUnmounted(() => {
    cleanup()
    window.removeEventListener('resize', initScrollAnimation)
  })

  // 返回控制方法
  return {
    init: initScrollAnimation,
    cleanup: cleanup,
    refresh: refresh
  }
}
