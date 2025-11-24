<template>
  <div class="scroll-snap-carousel-wrapper">
    <div ref="scrollContainer" class="scroll-snap-container" @scroll="handleScroll">
      <div class="scroll-snap-content">
        <!-- <div class="scroll-snap-item-left" :style="{ width: gap + 'px' }"></div> -->
        <div
          v-for="(item, index) in items"
          :key="index"
          :ref="el => setItemRef(el, index)"
          class="scroll-snap-item"
        >
          <slot name="item" :item="item" :index="index">
            <div class="default-item-content">
              <div class="default-item">
                <img
                  v-if="isImage(item)"
                  :src="item.url"
                  :alt="item.originalName || `Image ${index + 1}`"
                />
                <VideoPlayer
                  v-else-if="isVideo(item)"
                  :src="item.url"
                  :height="videoHeight"
                  :muted="true"
                  :loop="true"
                  :autoplay="true"
                  :showControls="false"
                />
              </div>
              <div class="default-item-content-text">
                <h2>{{ item.des[0]?.text || 'ootd' }}</h2>
                <p>{{ item.des[1]?.text || 'Your Style, Your Echo.' }}</p>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- 可选的导航箭头 -->
    <div v-if="showArrows" class="carousel-arrows">
      <el-icon class="arrow left-arrow" @click="scrollToPrev">
        <ArrowLeft />
      </el-icon>
      <el-icon class="arrow right-arrow" @click="scrollToNext">
        <ArrowRight />
      </el-icon>
    </div>

    <!-- 可选的指示器 -->
    <div v-if="showIndicators" class="carousel-indicators">
      <span
        v-for="(item, index) in items"
        :key="index"
        class="indicator"
        :class="{ active: currentIndex === index }"
        @click="scrollToIndex(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import { isImage, isVideo } from '@/composables/useMediaType'

const props = defineProps({
  // 轮播数据
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // 每个项目的宽度（支持数字 px 或 CSS 字符串，如 calc()）
  itemWidth: {
    type: [Number, String],
    default: 300
  },
  height: {
    type: Number,
    default: 400
  },
  // 项目之间的间距（px）
  gap: {
    type: Number,
    default: 20
  },
  // 是否显示箭头
  showArrows: {
    type: Boolean,
    default: true
  },
  // 是否显示指示器
  showIndicators: {
    type: Boolean,
    default: true
  },
  // 滚动对齐方式：start, center, end
  snapAlign: {
    type: String,
    default: 'start',
    validator: value => ['start', 'center', 'end'].includes(value)
  }
})

const scrollContainer = ref(null)
const currentIndex = ref(0)
const isScrolling = ref(false)
const itemRefs = ref([])

// 计算视频高度（与图片容器一致，height 的 80%）
const videoHeight = computed(() => {
  return `${props.height * 0.8}px`
})

// 设置 item ref
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// 计算每个项目的实际宽度（包括间距）
// 如果 itemWidth 是字符串（CSS calc），则返回字符串；如果是数字，则计算数值
const itemWidthWithGap = computed(() => {
  if (typeof props.itemWidth === 'string') {
    // 如果是 CSS 字符串，返回字符串（用于 CSS），但无法在 JS 中精确计算
    // 这种情况下，滚动对齐主要依赖 CSS scroll-snap
    return `calc(${props.itemWidth} + ${props.gap}px)`
  }
  return props.itemWidth + props.gap
})

// 计算 itemWidth 的 CSS 值（用于样式绑定）
const itemWidthStyle = computed(() => {
  if (typeof props.itemWidth === 'string') {
    return props.itemWidth
  }
  return `${props.itemWidth}px`
})

// 处理滚动事件
const handleScroll = () => {
  if (!scrollContainer.value || isScrolling.value) return

  // 如果 itemWidth 是字符串（CSS calc），无法精确计算索引
  // 使用元素位置来判断当前索引
  if (typeof props.itemWidth === 'string') {
    const scrollLeft = scrollContainer.value.scrollLeft
    let closestIndex = 0
    let minDistance = Infinity

    // 遍历所有项目，找到最接近滚动位置的元素
    itemRefs.value.forEach((item, index) => {
      if (item) {
        const itemLeft = item.offsetLeft - props.gap
        const distance = Math.abs(scrollLeft - itemLeft)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      }
    })

    currentIndex.value = closestIndex
    return
  }

  // 数字类型，使用原来的计算方式
  const scrollLeft = scrollContainer.value.scrollLeft
  // 减去左侧占位元素的宽度
  const adjustedScrollLeft = scrollLeft - props.gap

  // 计算索引（考虑左侧占位元素）
  if (adjustedScrollLeft < 0) {
    currentIndex.value = 0
  } else {
    currentIndex.value = Math.round(adjustedScrollLeft / itemWidthWithGap.value)
    if (currentIndex.value >= props.items.length) {
      currentIndex.value = props.items.length - 1
    }
  }
}

// 滚动到指定索引
const scrollToIndex = index => {
  if (!scrollContainer.value || index < 0 || index >= props.items.length) return
  if (isScrolling.value) return // 防止重复点击

  isScrolling.value = true

  const targetElement = itemRefs.value[index]

  // 如果元素存在，使用 offsetLeft 计算精确位置
  if (targetElement) {
    // 计算目标滚动位置：元素位置减去左侧占位宽度
    const elementOffsetLeft = targetElement.offsetLeft
    const targetScroll = elementOffsetLeft - props.gap

    scrollContainer.value.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })

    // 立即更新索引，让 UI 响应更快
    currentIndex.value = index
  } else {
    // 如果 ref 还没准备好，等待元素渲染
    setTimeout(() => {
      const element = itemRefs.value[index]
      if (element && scrollContainer.value) {
        const elementOffsetLeft = element.offsetLeft
        const targetScroll = elementOffsetLeft - props.gap

        scrollContainer.value.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        })

        currentIndex.value = index
      }
    }, 100)
  }

  // 等待滚动完成后再允许下一次滚动
  setTimeout(() => {
    isScrolling.value = false
    // 确保索引正确（滚动可能被 snap 调整）
    if (scrollContainer.value && itemRefs.value[index]) {
      handleScroll()
    }
  }, 600)
}

// 滚动到上一个
const scrollToPrev = () => {
  const prevIndex = currentIndex.value > 0 ? currentIndex.value - 1 : 0
  scrollToIndex(prevIndex)
}

// 滚动到下一个
const scrollToNext = () => {
  const nextIndex =
    currentIndex.value < props.items.length - 1 ? currentIndex.value + 1 : props.items.length - 1
  scrollToIndex(nextIndex)
}
</script>

<style lang="scss" scoped>
.scroll-snap-carousel-wrapper {
  position: relative;
  margin: var(--mgm-gap) auto;
}

.scroll-snap-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  /* Chrome, Safari, Opera - 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    display: none;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    display: none;
    background: transparent;
  }
}

.scroll-snap-content {
  display: flex;
  gap: v-bind('gap + "px"');
  padding: 0;
  width: max-content;
}

.scroll-snap-item {
  padding-left: var(--double-edge-border-width);
  scroll-snap-align: v-bind('snapAlign');
  scroll-snap-stop: always;
  height: 100%;
  margin-top: var(--gutter-width);
}

.default-item-content {
  height: v-bind('height + "px"');
  width: v-bind('itemWidthStyle');
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .default-item-content-text {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: var(--gutter-width);
  }
  .default-item {
    overflow: hidden;
    position: relative;
    border-radius: 24px;
    height: 80%;
    width: 100%;
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
}

/* 箭头样式 */
.carousel-arrows {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  padding: 0 16px;
  z-index: 10;
}

.arrow {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-size: 20px;
  color: #475669;
  pointer-events: all;
}

.arrow:hover {
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: scale(1.1);
}

.arrow:active {
  transform: scale(0.95);
}

/* 指示器样式 */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  z-index: 10;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: rgba(0, 0, 0, 0.8);
  width: 24px;
  border-radius: 4px;
}

.indicator:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
