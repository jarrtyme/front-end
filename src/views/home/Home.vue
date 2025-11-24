<template>
  <Header />

  <el-main>
    <div class="home">
      <!-- 根据 displayType 动态渲染组件 -->
      <template v-for="component in sortedComponents" :key="component._id || component.name">
        <!-- carousel: 轮播图 -->
        <ImageCarousel
          v-if="component.displayType === DISPLAY_TYPES.CAROUSEL && component.isActive"
          :items="getComponentItemsData(component)"
        />

        <!-- grid: 网格布局 -->
        <Desccard
          v-else-if="component.displayType === DISPLAY_TYPES.GRID && component.isActive"
          :items="getComponentItemsData(component)"
        />

        <!-- list: 列表布局 -->
        <Bigner
          v-else-if="component.displayType === DISPLAY_TYPES.LIST && component.isActive"
          :items="getComponentItemsData(component)"
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
        />

        <!-- seamless: 无缝滚动 -->
        <SeamlessCarousel
          v-else-if="component.displayType === DISPLAY_TYPES.SEAMLESS && component.isActive"
          :items="getComponentItemsData(component)"
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
    </div>
  </el-main>

  <Footer />
</template>

<script setup name="Home">
import { computed, onMounted, ref } from 'vue'
import ImageCarousel from '@/views/Home/components/ImageCarousel.vue'
import ScrollSnapCarousel from '@/views/Home/components/ScrollSnapCarousel.vue'
import SeamlessCarousel from '@/views/Home/components/SeamlessCarousel.vue'
import Desccard from '@/views/Home/components/Desccard.vue'
import Bigner from '@/views/Home/components/Bigner.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import Header from '@/views/Home/components/Header.vue'
import Footer from '@/views/Home/components/Footer.vue'
import { getPublicPageComponentsByIds } from '@/api/pageComponent'
import { DISPLAY_TYPES, DEFAULT_DISPLAY_TYPE } from '@/config/displayType'

// 存储组件列表
const componentsList = ref([])

// 按 order 排序后的组件列表
const sortedComponents = computed(() => {
  return [...componentsList.value].sort((a, b) => {
    const orderA = a.order ?? 0
    const orderB = b.order ?? 0
    return orderA - orderB
  })
})

// Fisher-Yates 洗牌算法，用于随机排列数组
const shuffleArray = array => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 获取组件的数据项（映射为组件需要的格式）
const getComponentItemsData = component => {
  if (!component || !component.items || !Array.isArray(component.items)) {
    return []
  }

  const items = component.items.map(item => ({
    url: item?.media?.url || '',
    originalName: item?.media?.filename || '',
    name: item?.media?.filename || '',
    // 确保 descriptions 是数组格式，兼容后端返回的数据结构
    des: Array.isArray(item?.descriptions)
      ? item.descriptions.map(desc => (typeof desc === 'string' ? { text: desc } : desc))
      : [],
    descriptions: Array.isArray(item?.descriptions)
      ? item.descriptions.map(desc => (typeof desc === 'string' ? { text: desc } : desc))
      : [],
    type: item?.media?.type || 'image', // 使用后端返回的 type
    fileType: item?.media?.type || 'image',
    media: {
      url: item?.media?.url || '',
      type: item?.media?.type || 'image',
      filename: item?.media?.filename || ''
    }
  }))

  // 随机排列 items
  return shuffleArray(items)
}

// 获取视频源地址（取第一个视频项）
const getVideoSrc = component => {
  if (!component || !component.items || !Array.isArray(component.items)) return ''
  const videoItem = component.items.find(item => item?.media?.type === 'video')
  return videoItem?.media?.url || component.items[0]?.media?.url || ''
}

// 获取视频高度（可以从 descriptions 中获取配置，或使用默认值）
const getVideoHeight = component => {
  // 可以从 descriptions 或 component 的其他配置中读取
  // 暂时使用默认值
  return '100vh'
}

// 获取视频文字（从 descriptions 中获取）
const getVideoText = component => {
  if (!component || !component.items || !Array.isArray(component.items)) return ''
  const firstItem = component.items[0]
  if (
    firstItem?.descriptions &&
    Array.isArray(firstItem.descriptions) &&
    firstItem.descriptions.length > 0
  ) {
    return firstItem.descriptions[0]?.text || ''
  }
  return ''
}

// 获取视频是否显示控件
const getVideoShowControls = component => {
  // 默认显示控件
  return true
}

// 获取视频是否静音
const getVideoMuted = component => {
  // 默认静音（自动播放需要）
  return true
}

// 获取视频是否循环
const getVideoLoop = component => {
  // 默认循环
  return true
}

// 获取视频是否自动播放
const getVideoAutoplay = component => {
  // 默认自动播放
  return true
}

// 获取滚动快照的高度
const getScrollSnapHeight = component => {
  // 可以从 component 的配置中读取，或使用默认值
  // 暂时使用默认值 640
  return 640
}

// 获取滚动快照的宽度模式
const getScrollSnapWidthMode = component => {
  // 可以从 component 的配置中读取 widthMode
  // 支持从 component.widthMode 或 component.config?.widthMode 读取
  // 默认使用 'wide' 宽模式
  return component?.widthMode || component?.config?.widthMode || 'wide'
}

// 加载页面组件数据
const loadPageComponents = async () => {
  try {
    // 获取所有启用的组件（可以通过页面配置传入组件ID列表）
    // 这里先使用硬编码的ID列表，后续可以改为从页面配置读取
    const response = await getPublicPageComponentsByIds([
      '691ddd42b580fac330cd7ed2',
      '691ddcfdb580fac330cd7eb6',
      '691ddc85b580fac330cd7e4c',
      '691dda95b580fac330cd7d00',
      '691ddd1bb580fac330cd7ec6'
    ])

    if (response && response.code === 200 && Array.isArray(response.data)) {
      // 保存完整的组件信息，包括 displayType, order, isActive, widthMode
      componentsList.value = response.data.map(component => ({
        _id: component._id?.toString() || component._id, // 确保 ID 是字符串
        name: component.name || '',
        displayType: component.displayType || DEFAULT_DISPLAY_TYPE,
        order: component.order ?? 0,
        isActive: component.isActive !== false, // 默认为 true
        items: Array.isArray(component.items) ? component.items : [],
        widthMode: component.widthMode || 'wide' // 滚动快照宽度模式，默认为 'wide'
      }))
    }

    console.log('加载的组件列表:', componentsList.value)
  } catch (error) {
    console.error('加载页面组件失败:', error)
    // 静默失败，不显示错误提示，因为Home页面是公开页面，可能未登录
  }
}

onMounted(() => {
  loadPageComponents()
})
</script>

<style lang="scss" scoped>
.home {
  margin: 0 auto;
}
// Home 页面特定样式
</style>
