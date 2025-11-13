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

    <!-- 自定义箭头按钮 -->
    <div class="custom-arrows">
      <el-icon class="arrow left-arrow" @click="prevSlide">
        <ArrowLeft />
      </el-icon>
      <el-icon class="arrow right-arrow" @click="nextSlide">
        <ArrowRight />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  // 轮播图数据，可以是数字数组、图片URL数组或对象数组
  items: {
    type: Array,
    default: () => [1, 2, 3, 4, 5, 6]
  }
})

const windowWidth = ref(window.innerWidth)
const carouselRef = ref(null)

// 触摸滑动相关
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const isDragging = ref(false)
const startX = ref(0)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 箭头切换方法
const prevSlide = () => {
  carouselRef.value?.prev()
}

const nextSlide = () => {
  carouselRef.value?.next()
}

// 触摸事件处理
const handleTouchStart = e => {
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isDragging.value = true
}

const handleTouchMove = e => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  touchEndX.value = touch.clientX
  touchEndY.value = touch.clientY
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value

  // 判断是否为水平滑动（水平距离大于垂直距离）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右滑动，显示上一张
      prevSlide()
    } else {
      // 向左滑动，显示下一张
      nextSlide()
    }
  }

  isDragging.value = false
  touchStartX.value = 0
  touchStartY.value = 0
  touchEndX.value = 0
  touchEndY.value = 0
}

// 鼠标拖拽事件处理（桌面端）
const handleMouseDown = e => {
  isDragging.value = true
  startX.value = e.clientX
  e.preventDefault()
}

const handleMouseMove = e => {
  if (!isDragging.value) return
  e.preventDefault()
}

const handleMouseUp = e => {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value

  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右拖拽，显示上一张
      prevSlide()
    } else {
      // 向左拖拽，显示下一张
      nextSlide()
    }
  }

  isDragging.value = false
  startX.value = 0
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
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

/* 自定义箭头样式 */
.custom-arrows {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 12px;
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
}

.arrow:hover {
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  transform: scale(1.1);
}

.arrow:active {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-arrows {
    bottom: 12px;
    right: 12px;
    gap: 10px;
  }

  .arrow {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
