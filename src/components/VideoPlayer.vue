<template>
  <div ref="containerRef" class="video-player-container" :class="{ 'is-playing': isPlaying }">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      class="video-player"
      :muted="muted"
      :loop="loop"
      :autoplay="autoplay"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @loadedmetadata="handleLoadedMetadata"
    >
      您的浏览器不支持视频播放
    </video>
    <!-- 文字镂空效果：渐变色背景层，文字部分透明 -->
    <div v-if="text" class="video-text-overlay">
      <svg class="mask-svg" width="100%" height="100%">
        <defs>
          <linearGradient :id="`gradient-${maskId}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="gradientColors.start" />
            <stop offset="50%" :stop-color="gradientColors.mid" />
            <stop offset="100%" :stop-color="gradientColors.end" />
          </linearGradient>
          <mask :id="maskId" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <text
              ref="maskTextRef"
              x="50%"
              y="50%"
              dominant-baseline="middle"
              text-anchor="middle"
              class="mask-text"
            >
              {{ text }}
            </text>
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          :fill="`url(#gradient-${maskId})`"
          :mask="`url(#${maskId})`"
        />
      </svg>
    </div>
    <!-- 右上角播放控件 -->
    <div class="video-controls" :class="{ 'is-visible': showControls }">
      <el-button
        :icon="isPlaying ? VideoPause : VideoPlay"
        circle
        size="large"
        class="play-button"
        @click="togglePlay"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const props = defineProps({
  // 视频源地址
  src: {
    type: String,
    required: true
  },
  // 封面图
  poster: {
    type: String,
    default: ''
  },
  // 是否静音（自动播放需要静音）
  muted: {
    type: Boolean,
    default: true
  },
  // 是否循环播放
  loop: {
    type: Boolean,
    default: true
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    default: true
  },
  // 是否显示控件
  showControls: {
    type: Boolean,
    default: true
  },
  // 镂空文字内容
  text: {
    type: String,
    default: ''
  },
  // 渐变色配置
  gradientColors: {
    type: Object,
    default: () => ({
      start: '#000', // 紫色
      mid: '#000', // 深紫色
      end: '#000' // 粉紫色
    })
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)
const containerRef = ref(null)
const maskTextRef = ref(null)

// 生成唯一的 mask ID（避免多个组件实例冲突）
const maskId = ref(`text-mask-${Math.random().toString(36).substr(2, 9)}`)

// 渐变色配置（支持通过 props 传入或使用默认值）
const gradientColors = computed(() => props.gradientColors)

// 使用滚动动画 hook
const animationOptions = {
  start: 'top top',
  end: 2000,
  enabled: !!props.text, // 只有当有文字时才启用动画
  minScale: 32,
  maxScale: 1,
  pin: true,
  pinSpacing: true,
  scrub: 1
}
console.log('VideoPlayer 中的 animationOptions:', animationOptions)
useScrollAnimation(containerRef, maskTextRef, animationOptions)

// 播放
const handlePlay = () => {
  isPlaying.value = true
}

// 暂停
const handlePause = () => {
  isPlaying.value = false
}

// 播放结束
const handleEnded = () => {
  // 如果设置了循环，会自动重新播放
  if (props.loop && videoRef.value) {
    videoRef.value.play().catch(() => {
      // 自动播放失败时忽略错误
    })
  }
}

// 视频元数据加载完成
const handleLoadedMetadata = () => {
  // 确保自动播放
  if (props.autoplay && videoRef.value) {
    videoRef.value.play().catch(() => {
      // 自动播放失败时忽略错误（浏览器策略限制）
    })
  }
}

// 切换播放/暂停
const togglePlay = () => {
  if (!videoRef.value) return

  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play().catch(() => {
      // 播放失败时忽略错误
    })
  }
}

// 监听 src 变化，重新加载视频
watch(
  () => props.src,
  () => {
    if (videoRef.value) {
      videoRef.value.load()
      if (props.autoplay) {
        videoRef.value.play().catch(() => {
          // 自动播放失败时忽略错误
        })
      }
    }
  }
)

// 组件挂载后确保播放
onMounted(() => {
  if (videoRef.value && props.autoplay) {
    // 延迟一下确保视频元素已准备好
    setTimeout(() => {
      videoRef.value?.play().catch(() => {
        // 自动播放失败时忽略错误
      })
    }, 100)
  }
})

// 组件卸载时暂停播放
onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})

// 暴露方法供父组件调用
defineExpose({
  play: () => videoRef.value?.play(),
  pause: () => videoRef.value?.pause(),
  toggle: togglePlay,
  video: videoRef
})
</script>

<style lang="scss" scoped>
.video-player-container {
  position: relative;
  overflow: hidden;
  background-color: #000;
  margin-bottom: var(--gutter-width);

  .video-player {
    width: 100vw !important;
    height: 100vh !important;
    object-fit: cover;
    display: block;
  }

  .video-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    transition: opacity 0.3s ease;

    &.is-visible {
      opacity: 1;
    }

    .play-button {
      background-color: rgba(0, 0, 0, 0.5);
      border: none;
      color: #fff;
      backdrop-filter: blur(4px);
      transition: all 0.3s ease;
      font-size: 40px;
      width: 40px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.7);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  // 播放状态样式
  &.is-playing {
    .video-controls {
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }

  // 文字镂空效果：纯色背景层，文字部分透明
  .video-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    pointer-events: none; // 不阻挡视频交互
    overflow: hidden;
    background-color: #00000000 !important;

    // SVG mask 实现真正的镂空
    .mask-svg {
      width: 100%;
      height: 100%;
      display: block;

      .mask-text {
        font-size: 72px;
        font-weight: 900;
        letter-spacing: 4px;
        text-transform: uppercase;
        fill: black; // mask 中黑色表示透明，白色表示不透明
        font-family: var(--app-font-family, 'SF Pro', sans-serif);
        transform-origin: 50% 50%; // 设置缩放中心点（SVG transform 的默认中心点）
        will-change: transform; // 优化性能

        @media (max-width: 768px) {
          font-size: 48px;
          letter-spacing: 2px;
        }
        @media (max-width: 480px) {
          font-size: 36px;
          letter-spacing: 1px;
        }
      }
    }
  }
}
</style>
