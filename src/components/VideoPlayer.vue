<template>
  <div class="video-player-container" :class="{ 'is-playing': isPlaying }">
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { VideoPlay, VideoPause } from '@element-plus/icons-vue'

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
  }
})

const videoRef = ref(null)
const isPlaying = ref(false)

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
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;

  .video-player {
    width: 100%;
    height: 100%;
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
      font-size: 45px;

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
}
</style>
