<template>
  <div class="media-item-wrapper" :class="wrapperClass">
    <!-- 图片 -->
    <img
      v-if="isImageItem"
      :src="item.url || item.media?.url || item"
      :alt="item.originalName || item.name || item.media?.filename || altText"
      :class="imageClass"
    />
    <!-- 视频 -->
    <VideoPlayer
      v-else-if="isVideoItem"
      :src="item.url || item.media?.url || item"
      :height="videoHeight"
      :muted="videoMuted"
      :loop="videoLoop"
      :autoplay="videoAutoplay"
      :showControls="videoShowControls"
      :poster="videoPoster"
      :text="videoText"
      :gradientColors="videoGradientColors"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VideoPlayer from './VideoPlayer.vue'
import { isImage, isVideo } from '@/composables/useMediaType'

const props = defineProps({
  // 媒体项数据
  item: {
    type: [Object, String, Number],
    required: true
  },
  // 图片的 alt 文本
  altText: {
    type: String,
    default: 'Media item'
  },
  // 视频高度
  videoHeight: {
    type: String,
    default: '100%'
  },
  // 视频是否静音
  videoMuted: {
    type: Boolean,
    default: true
  },
  // 视频是否循环
  videoLoop: {
    type: Boolean,
    default: true
  },
  // 视频是否自动播放
  videoAutoplay: {
    type: Boolean,
    default: true
  },
  // 视频是否显示控件
  videoShowControls: {
    type: Boolean,
    default: false
  },
  // 视频封面图
  videoPoster: {
    type: String,
    default: ''
  },
  // 视频文字
  videoText: {
    type: String,
    default: ''
  },
  // 视频渐变色
  videoGradientColors: {
    type: Object,
    default: null
  },
  // 包装器类名
  wrapperClass: {
    type: String,
    default: ''
  },
  // 图片类名
  imageClass: {
    type: String,
    default: ''
  }
})

// 计算是否为图片或视频（使用 computed 以便响应式更新）
const isImageItem = computed(() => isImage(props.item))
const isVideoItem = computed(() => isVideo(props.item))
</script>

<style lang="scss" scoped>
.media-item-wrapper {
  width: 100%;
  height: 100%;
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
</style>
