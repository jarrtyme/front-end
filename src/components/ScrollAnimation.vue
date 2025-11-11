<template>
  <!-- 这是一个逻辑组件，不渲染任何内容 -->
  <div v-if="false"></div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  // 容器元素（触发 ScrollTrigger 的元素）- 传入 ref 对象
  container: {
    type: Object,
    required: true
  },
  // 要动画化的目标元素 - 传入 ref 对象
  target: {
    type: Object,
    required: true
  },
  // ScrollTrigger 开始位置
  start: {
    type: String,
    default: 'top top'
  },
  // ScrollTrigger 结束位置
  end: {
    type: [String, Number],
    default: 'bottom top'
  },
  // 是否吸顶
  pin: {
    type: Boolean,
    default: true
  },
  // 是否保留吸顶时的空间
  pinSpacing: {
    type: Boolean,
    default: true
  },
  // 平滑跟随滚动的延迟（秒）
  scrub: {
    type: [Boolean, Number],
    default: 1
  },
  // 缩放范围：从 minScale 到 maxScale
  minScale: {
    type: Number,
    default: 1
  },
  maxScale: {
    type: Number,
    default: 20
  },
  // 是否启用动画
  enabled: {
    type: Boolean,
    default: true
  }
})

// ScrollTrigger 实例
let scrollTriggerInstance = null

// 初始化滚动动画
const initScrollAnimation = () => {
  if (!props.enabled) return

  // 获取容器和目标元素的 DOM 节点
  const containerElement = props.container?.value || props.container
  const targetElement = props.target?.value || props.target

  if (!containerElement || !targetElement) return

  // 清理之前的 ScrollTrigger
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
  gsap.set(containerElement, { zIndex: 20 })
  gsap.set(targetElement, { zIndex: 21 })

  // 创建一个虚拟对象来存储缩放值，用于 Timeline 动画
  const scaleObj = { scale: props.minScale, transformOrigin: 'center center' }

  // 创建 GSAP Timeline
  const tl = gsap.timeline({
    paused: true, // 暂停时间线，由 ScrollTrigger 控制
    defaults: {
      ease: 'none' // 默认无缓动，跟随滚动
    }
  })

  // 在时间线中添加缩放动画
  tl.to(scaleObj, {
    scale: props.maxScale,
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

  // 创建 ScrollTrigger，控制时间线
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: containerElement,
    start: props.start,
    end: props.end,
    pin: props.pin,
    pinSpacing: props.pinSpacing,
    scrub: props.scrub,
    animation: tl, // 将时间线绑定到 ScrollTrigger
    onEnter: () => {
      // 进入时设置初始状态
      if (targetElement) {
        gsap.set(targetElement, { scale: props.minScale, transformOrigin: 'center center' })
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
    onRefresh: () => {
      // 刷新时移除宽度限制
      removeWidthRestriction()
    }
  })

  // 移除 ScrollTrigger pin 时添加的宽度限制
  const removeWidthRestriction = () => {
    if (props.pin && containerElement) {
      // ScrollTrigger 会在容器外创建 pin-spacer 包装器
      const pinSpacer = containerElement.closest('.pin-spacer')
      if (pinSpacer) {
        pinSpacer.style.maxWidth = 'none'
        pinSpacer.style.width = 'auto'
      }
      // 也检查容器本身
      if (containerElement.style.maxWidth) {
        containerElement.style.maxWidth = 'none'
      }
    }
  }

  // 立即移除宽度限制
  setTimeout(() => {
    removeWidthRestriction()
    // 触发一次 refresh 确保样式生效
    ScrollTrigger.refresh()
  }, 0)
}

// 清理动画
const cleanup = () => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
}

// 监听 props 变化，重新初始化
watch(
  () => [props.container?.value, props.target?.value, props.enabled],
  () => {
    cleanup()
    if (props.enabled) {
      setTimeout(() => {
        initScrollAnimation()
      }, 100)
    }
  },
  { deep: true }
)

// 组件挂载后初始化动画
onMounted(() => {
  if (props.enabled) {
    // 延迟一下确保 DOM 已渲染完成
    setTimeout(() => {
      initScrollAnimation()
      // 窗口大小改变时重新计算
      window.addEventListener('resize', initScrollAnimation)
    }, 200)
  }
})

// 组件卸载时清理动画
onUnmounted(() => {
  cleanup()
  window.removeEventListener('resize', initScrollAnimation)
})

// 暴露方法供父组件调用
defineExpose({
  init: initScrollAnimation,
  cleanup: cleanup,
  refresh: () => {
    cleanup()
    initScrollAnimation()
  }
})
</script>
