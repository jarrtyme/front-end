<template>
  <template v-if="headerComponents.length">
    <Header
      v-for="component in headerComponents"
      :key="component._id || component.name"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />
  </template>

  <el-main>
    <div class="home">
      <!-- 根据 displayType 动态渲染组件 -->
      <template v-for="component in contentComponents" :key="component._id || component.name">
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
    </div>
  </el-main>

  <template v-if="footerComponents.length">
    <Footer
      v-for="component in footerComponents"
      :key="component._id || component.name"
      :items="getComponentItemsData(component)"
      :link="component.link"
    />
  </template>
  <Footer v-else />
</template>

<script setup name="Home">
import { computed, ref, watch, onMounted } from 'vue'
import ImageCarousel from '@/views/Home/components/ImageCarousel.vue'
import ScrollSnapCarousel from '@/views/Home/components/ScrollSnapCarousel.vue'
import SeamlessCarousel from '@/views/Home/components/SeamlessCarousel.vue'
import Desccard from '@/views/Home/components/Desccard.vue'
import Bigner from '@/views/Home/components/Bigner.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ComponentDetail from '@/views/Home/components/ComponentDetail.vue'
import Header from '@/views/Home/components/Header.vue'
import Footer from '@/views/Home/components/Footer.vue'
import { getPublicPageComponentsByIds } from '@/api/pageComponent'
import { getPublicPageById } from '@/api/page'
import { DISPLAY_TYPES, DEFAULT_DISPLAY_TYPE } from '@/config/displayType'
import { useRoute, useRouter } from 'vue-router'

// 存储组件列表
const componentsList = ref([])
const isLoadingComponents = ref(false)
const loadError = ref('')

const DEFAULT_PAGE_ID = '69184f3ac478e22e4de2698d'

// 路由实例，用于读取 query 中的页面 id
const route = useRoute()
const router = useRouter()

const currentPageId = computed(() => {
  return (route.query?.id || '').toString().trim() || DEFAULT_PAGE_ID
})

// 按 order 排序后的组件列表
const sortedComponents = computed(() => {
  return [...componentsList.value].sort((a, b) => {
    const orderA = a.order ?? 0
    const orderB = b.order ?? 0
    return orderA - orderB
  })
})

const headerComponents = computed(() =>
  sortedComponents.value.filter(
    component => component.displayType === DISPLAY_TYPES.HEADER && component.isActive
  )
)

const footerComponents = computed(() =>
  sortedComponents.value.filter(
    component => component.displayType === DISPLAY_TYPES.FOOTER && component.isActive
  )
)

const contentComponents = computed(() =>
  sortedComponents.value.filter(
    component =>
      ![DISPLAY_TYPES.HEADER, DISPLAY_TYPES.FOOTER].includes(component.displayType) &&
      component.isActive
  )
)

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
const loadPageComponents = async pageId => {
  if (!pageId) {
    componentsList.value = []
    return
  }

  isLoadingComponents.value = true
  loadError.value = ''
  try {
    const response = await getPublicPageById(pageId)
    if (response && response.code === 200 && response.data) {
      componentsList.value = (response.data.componentIds || []).map(component => ({
        _id: component._id?.toString() || component._id, // 确保 ID 是字符串
        name: component.name || '',
        displayType: component.displayType || DEFAULT_DISPLAY_TYPE,
        order: component.order ?? 0,
        isActive: component.isActive !== false, // 默认为 true
        items: Array.isArray(component.items) ? component.items : [],
        widthMode: component.widthMode || 'wide',
        link: component.link || ''
      }))
      return
    }
    componentsList.value = []
    loadError.value = response?.message || '未找到对应页面配置'
  } catch (error) {
    console.error('加载页面组件失败:', error)
    componentsList.value = []
    loadError.value = error?.message || '加载页面组件失败'
  } finally {
    isLoadingComponents.value = false
  }
}

// 根据 URL 参数变化重新加载
watch(
  currentPageId,
  newId => {
    loadPageComponents(newId)
  },
  { immediate: true }
)

// 如果访问时没有 id 且存在默认值，保持 URL 一致
onMounted(() => {
  if (!route.query.id && DEFAULT_PAGE_ID) {
    router.replace({ query: { ...route.query, id: DEFAULT_PAGE_ID } })
  }
})
</script>

<style lang="scss" scoped>
.home {
  margin: 0 auto;
}
// Home 页面特定样式
</style>
