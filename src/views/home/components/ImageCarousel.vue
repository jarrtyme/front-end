<template>
  <div
    class="image-carousel-wrapper"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <el-carousel
      ref="carouselRef"
      :interval="4000"
      type=""
      height="200px"
      :autoplay="!isDragging"
      arrow="never"
      indicator-position="none"
      :loop="false"
      @change="handleCarouselChange"
    >
      <el-carousel-item v-for="item in items" :key="item.id || item">
        <h3 v-if="typeof item === 'number'" text="2xl" justify="center">{{ item }}</h3>
        <div v-else-if="item.url || typeof item === 'string'" class="carousel-item-content">
          <img :src="item.url || item" class="carousel-image" />
        </div>
        <div v-else class="carousel-item-inner">
          <slot name="item" :item="item" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 自定义导航箭头 -->
    <div class="carousel-arrows">
      <el-icon
        class="arrow left-arrow"
        :class="{ disabled: currentIndex === 0 }"
        @click="scrollToPrev"
      >
        <ArrowLeft />
      </el-icon>
      <el-icon
        class="arrow right-arrow"
        :class="{ disabled: currentIndex === items.length - 1 }"
        @click="scrollToNext"
      >
        <ArrowRight />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  // 轮播图数据，可以是数字数组、图片URL数组或对象数组
  items: {
    type: Array,
    default: () => [1, 2, 3, 4, 5, 6]
  }
})

const carouselRef = ref(null)
const currentIndex = ref(0)

// 触摸滑动相关
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)
const startX = ref(0)

// 监听轮播图切换事件
const handleCarouselChange = index => {
  currentIndex.value = index
}

// 触摸事件处理
const handleTouchStart = e => {
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  isDragging.value = true
}

const handleTouchMove = e => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  touchEndX.value = touch.clientX
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const deltaX = touchEndX.value - touchStartX.value

  // 判断是否为水平滑动（水平距离大于50px）
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右滑动，显示上一张 - 不循环
      if (carouselRef.value && props.items.length > 0 && currentIndex.value > 0) {
        const prevIndex = currentIndex.value - 1
        if (typeof carouselRef.value.setActiveItem === 'function') {
          carouselRef.value.setActiveItem(prevIndex)
        } else if (typeof carouselRef.value.prev === 'function') {
          carouselRef.value.prev()
        }
      }
    } else {
      // 向左滑动，显示下一张 - 不循环
      if (
        carouselRef.value &&
        props.items.length > 0 &&
        currentIndex.value < props.items.length - 1
      ) {
        const nextIndex = currentIndex.value + 1
        if (typeof carouselRef.value.setActiveItem === 'function') {
          carouselRef.value.setActiveItem(nextIndex)
        } else if (typeof carouselRef.value.next === 'function') {
          carouselRef.value.next()
        }
      }
    }
  }

  isDragging.value = false
  touchStartX.value = 0
  touchEndX.value = 0
}

// 鼠标拖拽事件处理（桌面端）
const handleMouseDown = e => {
  // 如果点击的是箭头按钮，不触发拖拽
  if (e.target.closest('.carousel-arrows') || e.target.closest('.arrow')) {
    return
  }
  isDragging.value = true
  startX.value = e.clientX
  e.preventDefault()
}

// 滚动到上一个
const scrollToPrev = () => {
  if (!carouselRef.value || currentIndex.value === 0) return
  const prevIndex = currentIndex.value - 1
  if (typeof carouselRef.value.setActiveItem === 'function') {
    carouselRef.value.setActiveItem(prevIndex)
  } else if (typeof carouselRef.value.prev === 'function') {
    carouselRef.value.prev()
  }
}

// 滚动到下一个
const scrollToNext = () => {
  if (!carouselRef.value || currentIndex.value >= props.items.length - 1) return
  const nextIndex = currentIndex.value + 1
  if (typeof carouselRef.value.setActiveItem === 'function') {
    carouselRef.value.setActiveItem(nextIndex)
  } else if (typeof carouselRef.value.next === 'function') {
    carouselRef.value.next()
  }
}

const handleMouseMove = e => {
  if (!isDragging.value) return
}

const handleMouseUp = e => {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value

  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右拖拽，显示上一张 - 不循环
      if (carouselRef.value && props.items.length > 0 && currentIndex.value > 0) {
        const prevIndex = currentIndex.value - 1
        if (typeof carouselRef.value.setActiveItem === 'function') {
          carouselRef.value.setActiveItem(prevIndex)
        } else if (typeof carouselRef.value.prev === 'function') {
          carouselRef.value.prev()
        }
      }
    } else {
      // 向左拖拽，显示下一张 - 不循环
      if (
        carouselRef.value &&
        props.items.length > 0 &&
        currentIndex.value < props.items.length - 1
      ) {
        const nextIndex = currentIndex.value + 1
        if (typeof carouselRef.value.setActiveItem === 'function') {
          carouselRef.value.setActiveItem(nextIndex)
        } else if (typeof carouselRef.value.next === 'function') {
          carouselRef.value.next()
        }
      }
    }
  }

  isDragging.value = false
  startX.value = 0
}
</script>

<style scoped>
.image-carousel-wrapper {
  position: relative;
  user-select: none;
  touch-action: pan-x;
  cursor: grab;
  margin-bottom: var(--gutter-width);
}

.image-carousel-wrapper:active {
  cursor: grabbing;
}

/* 保持和原有样式完全一致的 h3 样式 */
:deep(.el-carousel__item h3) {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.carousel-item-content {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-item-inner {
  width: 100%;
  height: 100%;
}

/* 保持和原有样式一致的背景色 */
:deep(.el-carousel__item:nth-child(2n)) {
  background-color: #99a9bf;
}

:deep(.el-carousel__item:nth-child(2n + 1)) {
  background-color: #d3dce6;
}

/* 自定义导航箭头样式 */
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
  position: relative;
}

.arrow:hover {
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: scale(1.1);
}

.arrow:active {
  transform: scale(0.95);
}

.arrow.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
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
}
</style>
