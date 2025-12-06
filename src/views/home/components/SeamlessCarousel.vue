<template>
  <div
    ref="containerRef"
    class="seamless-carousel"
    :class="{ 'is-paused': isPaused, 'is-vertical': direction === 'vertical' }"
  >
    <!-- @mouseenter="handleMouseEnter"
  @mouseleave="handleMouseLeave" -->
    <div ref="wrapperRef" class="seamless-carousel-wrapper" :style="wrapperStyle">
      <!-- 动态生成多个副本，确保铺满屏幕 -->
      <div
        v-for="(copy, copyIndex) in contentCopies"
        :key="`copy-${copyIndex}`"
        :ref="
          copyIndex === 0
            ? el => {
                if (el) contentRef = el
              }
            : null
        "
        class="seamless-carousel-content"
        :style="copyIndex > 0 ? cloneStyle : {}"
      >
        <slot>
          <div
            v-for="(item, index) in items"
            :key="`${copyIndex}-${index}`"
            class="carousel-item"
            :class="{ clickable: isClickable(item) }"
            @click="handleItemClick(item)"
          >
            <slot name="item" :item="item" :index="index">
              <div v-if="item.url" class="default-item">
                <img
                  v-if="isImage(item)"
                  :src="item.url"
                  :alt="item.originalName || `Image ${index + 1}`"
                />
                <VideoPlayer
                  v-else-if="isVideo(item)"
                  :src="item.url"
                  height="150px"
                  :muted="true"
                  :loop="true"
                  :autoplay="true"
                  :showControls="false"
                />
              </div>
              <div v-else class="default-item-text">{{ item }}</div>
            </slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import VideoPlayer from '@/components/VideoPlayer.vue'
import { isImage, isVideo } from '@/composables/useMediaType'
import { handleItemClick as handleItemClickUtil } from '@/utils/linkHandler'

const router = useRouter()

const props = defineProps({
  // 数据列表
  items: {
    type: Array,
    default: () => []
  },
  // 滚动方向：horizontal（水平）或 vertical（垂直）
  direction: {
    type: String,
    default: 'horizontal',
    validator: value => ['horizontal', 'vertical'].includes(value)
  },
  // 滚动速度（px/s）
  speed: {
    type: Number,
    default: 50
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    default: true
  },
  // 鼠标悬停时是否暂停
  pauseOnHover: {
    type: Boolean,
    default: true
  },

  // 项目宽度（水平滚动时）或高度（垂直滚动时）
  itemSize: {
    type: [Number, String],
    default: null
  },
  // 组件级别的链接
  link: {
    type: String,
    default: ''
  }
})

// 判断是否可点击
const isClickable = item => {
  return !!(item?.clothingId || item?.link || props.link)
}

// 处理点击事件
const handleItemClick = item => {
  handleItemClickUtil(item, props.link, router)
}

const containerRef = ref(null)
const wrapperRef = ref(null)
const contentRef = ref(null)

const isPaused = ref(!props.autoplay)
let animation = null
let contentSize = 0
const containerSize = ref(0)
const contentCopies = ref([0, 1]) // 默认两个副本

// 计算包装器样式
const wrapperStyle = computed(() => {
  return {}
})

// 克隆内容的样式（用于无缝循环）
// 不添加间距，确保首尾无缝衔接
const cloneStyle = computed(() => {
  return {}
})

// 处理鼠标进入
const handleMouseEnter = () => {
  if (props.pauseOnHover && animation) {
    animation.pause()
    isPaused.value = true
  }
}

// 处理鼠标离开
const handleMouseLeave = () => {
  if (props.pauseOnHover && props.autoplay && animation) {
    animation.resume()
    isPaused.value = false
  }
}

// 计算需要多少个副本才能铺满屏幕
const calculateCopies = () => {
  if (!containerRef.value || !contentRef.value) {
    contentCopies.value = [0, 1]
    return
  }

  const isVertical = props.direction === 'vertical'
  const container = isVertical ? containerRef.value.offsetHeight : containerRef.value.offsetWidth
  const content = isVertical ? contentRef.value.offsetHeight : contentRef.value.offsetWidth

  containerSize.value = container
  contentSize = content

  if (content === 0) {
    contentCopies.value = [0, 1]
    return
  }

  // 计算需要多少个副本才能至少铺满屏幕宽度的2倍（确保无缝循环）
  // 至少需要2个副本，但为了确保铺满，可能需要更多
  const minCopies = Math.ceil((container * 2) / content) + 1
  const copies = Math.max(2, minCopies) // 至少2个副本

  contentCopies.value = Array.from({ length: copies }, (_, i) => i)
}

// 使用 GSAP 创建无缝滚动动画
const createAnimation = () => {
  if (!wrapperRef.value || !contentRef.value) return

  const isVertical = props.direction === 'vertical'
  const size = isVertical ? contentRef.value.offsetHeight : contentRef.value.offsetWidth

  if (size === 0) return

  contentSize = size

  // 计算动画持续时间（基于速度和距离）
  const duration = size / props.speed

  // 清除之前的动画
  if (animation) {
    animation.kill()
    animation = null
  }

  // 创建无限循环动画，手动控制循环实现无缝效果
  const prop = isVertical ? 'y' : 'x'

  const animate = () => {
    // 如果已暂停，不继续动画
    if (isPaused.value || !props.autoplay) {
      return
    }

    // 重置位置到 0
    gsap.set(wrapperRef.value, {
      [prop]: 0
    })

    // 创建从 0 到 -size 的动画
    animation = gsap.to(wrapperRef.value, {
      [prop]: -size,
      duration: duration,
      ease: 'none',
      paused: false, // 总是创建未暂停的动画，由外部控制
      onComplete: () => {
        // 动画完成后，立即重新开始，实现无缝循环
        // 由于有克隆内容紧接在第一组内容后面，重置到 0 时视觉上看起来是连续的
        if (animation && !isPaused.value && props.autoplay) {
          animate()
        }
      }
    })

    // 如果应该暂停，立即暂停
    if (isPaused.value || !props.autoplay) {
      animation.pause()
    }
  }

  // 初始化位置
  gsap.set(wrapperRef.value, {
    [prop]: 0
  })

  animate()
}

// 初始化
const init = async () => {
  await nextTick()

  if (!containerRef.value) return

  // 等待 DOM 渲染完成
  await nextTick()

  // 使用 requestAnimationFrame 确保 DOM 已完全渲染
  requestAnimationFrame(() => {
    // 先计算需要多少个副本
    calculateCopies()

    // 等待副本渲染完成后再创建动画
    nextTick(() => {
      setTimeout(() => {
        if (contentRef.value) {
          calculateCopies() // 再次计算，确保尺寸准确
          createAnimation()
        }
      }, 50)
    })
  })
}

// 暂停
const pause = () => {
  if (animation) {
    animation.pause()
    isPaused.value = true
  } else {
    isPaused.value = true
  }
}

// 继续
const play = () => {
  isPaused.value = false

  if (animation) {
    // 检查动画是否已完成或无效
    try {
      const progress = animation.progress()
      const isActive = animation.isActive()
      const animationPaused = animation.paused()

      if (progress >= 1 || !isActive) {
        // 动画已完成或无效，重新创建动画
        createAnimation()
      } else if (animationPaused) {
        // 动画未完成且被暂停，恢复播放
        animation.resume()
      }
    } catch (e) {
      // 动画对象可能已无效，重新创建
      createAnimation()
    }
  } else {
    // 没有动画，创建新动画
    createAnimation()
  }
}

// 监听速度变化
watch(
  () => props.speed,
  () => {
    if (props.autoplay) {
      createAnimation()
    }
  }
)

// 监听自动播放变化
watch(
  () => props.autoplay,
  newVal => {
    if (newVal) {
      play()
    } else {
      pause()
    }
  }
)

// 监听 items 变化
watch(
  () => props.items,
  () => {
    nextTick(() => {
      calculateCopies()
      nextTick(() => {
        createAnimation()
      })
    })
  },
  { deep: true }
)

// 窗口大小变化处理
const resizeHandler = () => {
  calculateCopies()
  nextTick(() => {
    createAnimation()
  })
}

onMounted(() => {
  init()
  // 监听窗口大小变化
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (animation) {
    animation.kill()
    animation = null
  }
  window.removeEventListener('resize', resizeHandler)
})

// 暴露方法
defineExpose({
  play,
  pause,
  init: createAnimation
})
</script>

<style lang="scss" scoped>
.seamless-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: var(--mgm-gap) auto;

  &.is-vertical {
    height: 100%;
  }
}

.seamless-carousel-wrapper {
  display: flex;
  will-change: transform;

  .seamless-carousel.is-horizontal & {
    flex-direction: row;
  }

  .seamless-carousel.is-vertical & {
    flex-direction: column;
  }
}

.seamless-carousel-content {
  display: flex;
  flex-shrink: 0;
  gap: var(--gutter-width);
  margin-right: var(--gutter-width);

  .seamless-carousel.is-horizontal & {
    flex-direction: row;
  }

  .seamless-carousel.is-vertical & {
    flex-direction: column;
  }
}

.carousel-item {
  flex-shrink: 0;

  &.clickable {
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}

.default-item {
  width: 200px;
  height: 150px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  :deep(.video-player-container) {
    width: 100%;
    height: 100%;
    margin-bottom: 0;
  }
}

.default-item-text {
  padding: 20px;
  white-space: nowrap;
  font-size: 16px;
  color: var(--text-color, #1d1d1f);
}
</style>
