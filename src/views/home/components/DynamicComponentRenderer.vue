<template>
  <!-- 根据 displayType 动态渲染组件 -->
  <template v-for="component in components" :key="component._id || component.name">
    <!-- carousel: 轮播图 -->
    <ImageCarousel
      v-if="component.displayType === DISPLAY_TYPES.CAROUSEL && component.isActive"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />

    <!-- grid: 网格布局 -->
    <Desccard
      v-else-if="component.displayType === DISPLAY_TYPES.GRID && component.isActive"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />

    <!-- list: 列表布局 -->
    <Bigner
      v-else-if="component.displayType === DISPLAY_TYPES.LIST && component.isActive"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />

    <!-- scroll-snap: 滚动快照 -->
    <ScrollSnapCarousel
      v-else-if="component.displayType === DISPLAY_TYPES.SCROLL_SNAP && component.isActive"
      :items="getComponentItemsData(component)"
      :height="getScrollSnapHeight(component)"
      :widthMode="getScrollSnapWidthMode(component)"
      :gap="20"
      :showArrows="true"
      :showIndicators="false"
      snapAlign="start"
      :link="component.link"
    />

    <!-- seamless: 无缝滚动 -->
    <SeamlessCarousel
      v-else-if="component.displayType === DISPLAY_TYPES.SEAMLESS && component.isActive"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />

    <!-- detail: 详情描述 -->
    <ComponentDetail
      v-else-if="component.displayType === DISPLAY_TYPES.DETAIL && component.isActive"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />

    <!-- video: 视频播放器 -->
    <VideoPlayer
      v-else-if="component.displayType === DISPLAY_TYPES.VIDEO && component.isActive"
      :src="getVideoSrc(component)"
      :height="getVideoHeight(component)"
      :text="getVideoText(component)"
      :showControls="getVideoShowControls(component)"
      :muted="getVideoMuted(component)"
      :loop="getVideoLoop(component)"
      :autoplay="getVideoAutoplay(component)"
    />
  </template>
</template>

<script setup>
import ImageCarousel from '@/views/Home/components/ImageCarousel.vue'
import ScrollSnapCarousel from '@/views/Home/components/ScrollSnapCarousel.vue'
import SeamlessCarousel from '@/views/Home/components/SeamlessCarousel.vue'
import Desccard from '@/views/Home/components/Desccard.vue'
import Bigner from '@/views/Home/components/Bigner.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ComponentDetail from '@/views/Home/components/ComponentDetail.vue'
import { DISPLAY_TYPES } from '@/config/displayType'
import {
  getComponentItemsData,
  getVideoSrc,
  getVideoHeight,
  getVideoText,
  getVideoShowControls,
  getVideoMuted,
  getVideoLoop,
  getVideoAutoplay,
  getScrollSnapHeight,
  getScrollSnapWidthMode
} from '@/composables/usePageComponents'

defineProps({
  components: {
    type: Array,
    required: true,
    default: () => []
  }
})
</script>
