<template>
  <div
    class="swipeable-carousel-wrapper"
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
      :type="carouselType"
      :autoplay="!isDragging"
      height="var(--content-height)"
      arrow="never"
      indicator-position="none"
    >
      <el-carousel-item v-for="(item, index) in items" :key="item.id || item.url || index">
        <div class="default-item">
          <img :src="item.url" :alt="item.originalName || `Image ${index + 1}`" />
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  // 轮播数据
  items: {
    type: Array,
    required: true,
    default: () => []
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

const carouselType = computed(() => {
  return windowWidth.value < 768 ? '' : 'card'
})

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

  // 计算水平和垂直移动距离
  const deltaX = Math.abs(touch.clientX - touchStartX.value)
  const deltaY = Math.abs(touch.clientY - touchStartY.value)

  // 只有在水平滑动明显大于垂直滑动时才阻止默认行为（允许垂直滚动）
  if (deltaX > deltaY && deltaX > 10) {
    e.preventDefault()
  }
}

const handleTouchEnd = () => {
  if (!isDragging.value) return

  const deltaX = touchEndX.value - touchStartX.value
  const deltaY = touchEndY.value - touchStartY.value

  // 判断是否为水平滑动（水平距离大于垂直距离）
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右滑动，显示上一张
      carouselRef.value?.prev()
    } else {
      // 向左滑动，显示下一张
      carouselRef.value?.next()
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
  // 不阻止默认行为，允许页面滚动
  // e.preventDefault()
}

const handleMouseMove = e => {
  if (!isDragging.value) return
  // 不阻止默认行为，允许页面滚动
  // e.preventDefault()
}

const handleMouseUp = e => {
  if (!isDragging.value) return

  const deltaX = e.clientX - startX.value

  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // 向右拖拽，显示上一张
      carouselRef.value?.prev()
    } else {
      // 向左拖拽，显示下一张
      carouselRef.value?.next()
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
.swipeable-carousel-wrapper {
  user-select: none;
  touch-action: pan-x pan-y; /* 允许水平和垂直滑动 */
  cursor: grab;
  position: relative;
  margin: var(--mgm-gap) auto;
}

.swipeable-carousel-wrapper:active {
  cursor: grabbing;
}

.default-item {
  height: var(--content-height);
  width: 100%;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
}
</style>
