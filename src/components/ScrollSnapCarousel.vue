<template>
  <div class="scroll-snap-carousel-wrapper">
    <div ref="scrollContainer" class="scroll-snap-container" @scroll="handleScroll">
      <div class="scroll-snap-content">
        <div class="scroll-snap-item-left" :style="{ width: gap + 'px' }"></div>
        <div
          v-for="(item, index) in items"
          :key="index"
          :ref="el => setItemRef(el, index)"
          class="scroll-snap-item"
        >
          <slot name="item" :item="item" :index="index">
            <div class="default-item" :style="{ backgroundImage: `url(${item.url})` }"></div>
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

const props = defineProps({
  // 轮播数据
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // 每个项目的宽度（px）
  itemWidth: {
    type: Number,
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

// 设置 item ref
const setItemRef = (el, index) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// 计算每个项目的实际宽度（包括间距）
const itemWidthWithGap = computed(() => props.itemWidth + props.gap)

// 处理滚动事件
const handleScroll = () => {
  if (!scrollContainer.value || isScrolling.value) return

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

  const targetElement = itemRefs.value[index]
  if (!targetElement) {
    // 如果 ref 还没准备好，使用计算位置的方式
    isScrolling.value = true
    const targetScroll = props.gap + index * itemWidthWithGap.value
    scrollContainer.value.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
    currentIndex.value = index
    setTimeout(() => {
      isScrolling.value = false
    }, 500)
    return
  }

  isScrolling.value = true
  currentIndex.value = index

  // 使用 scrollIntoView 滚动到目标元素
  // inline: 'start' 确保元素对齐到容器的开始位置
  targetElement.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'start'
  })

  // 等待滚动完成
  setTimeout(() => {
    isScrolling.value = false
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

<style scoped>
.scroll-snap-carousel-wrapper {
  position: relative;
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
  scroll-snap-align: v-bind('snapAlign');
  scroll-snap-stop: always;
  height: 100%;
}

.default-item {
  height: v-bind('height + "px"');
  width: v-bind('itemWidth');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 8px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-arrows {
    padding: 0 8px;
  }

  .arrow {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .carousel-indicators {
    margin-top: 12px;
  }
}
</style>
