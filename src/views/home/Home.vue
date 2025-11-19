<template>
  <Header />

  <el-main>
    <!-- <div
      class="header-bg"
      style="height: var(--el-header-height-1); background-color: rgba(255, 255, 255, 0.8)"
    ></div> -->
    <div class="home">
      <div class="home-video-container">
        <VideoPlayer :src="getComponentItems('home5')[0]?.url || ''" text="Your Style, Your Echo." />
      </div>

      <Carousel :items="getComponentItems('home2')" />

      <ScrollSnapCarousel
        :items="getComponentItems('home3')"
        :height="400"
        :itemWidth="`calc(min(max(87.5vw, 280px) - 20px, 420px))`"
        :gap="20"
        :showArrows="true"
        :showIndicators="false"
        snapAlign="start"
      />

      <ImageCarousel :items="getComponentItems('home2')" />

      <ScrollSnapCarousel
        :items="getComponentItems('home3')"
        :height="640"
        :itemWidth="`calc(min(max(87.5vw, 280px) - 20px, 420px))`"
        :gap="20"
        :showArrows="true"
        :showIndicators="false"
        snapAlign="start"
      />

      <VideoPlayer :src="getComponentItems('home4')[0]?.url || ''" text="ootd" />

      <Desccard :items="getComponentItems('home2')" />
      <SeamlessCarousel
        :items="[
          ...getComponentItems('home1'),
          ...getComponentItems('home2'),
          ...getComponentItems('home3'),
          ...getComponentItems('home4')
        ]"
      />
      <Carousel :items="getComponentItems('home1')" />

      <Bigner :items="getComponentItems('home1')" />
    </div>
  </el-main>

  <Footer />
</template>

<script setup name="Home">
import { computed, onMounted, ref } from 'vue'
import Carousel from '@/views/Home/components/Carousel.vue'
import ImageCarousel from '@/views/Home/components/ImageCarousel.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ScrollSnapCarousel from '@/views/Home/components/ScrollSnapCarousel.vue'
import SeamlessCarousel from '@/views/Home/components/SeamlessCarousel.vue'
import Desccard from '@/views/Home/components/Desccard.vue'
import Bigner from '@/views/Home/components/Bigner.vue'
import Header from '@/views/Home/components/Header.vue'
import Footer from '@/views/Home/components/Footer.vue'
import { getPublicPageComponentsByIds } from '@/api/pageComponent'
const componentMediaList = ref([])
const componentItems = computed(() =>
  componentMediaList.value.reduce((acc, group) => {
    if (group?.name) {
      acc[group.name] = group.items ?? []
    }
    return acc
  }, {})
)

const getComponentItems = name => componentItems.value[name] || []

const mapComponentsToMediaList = response => {
  if (!response || !Array.isArray(response.data)) return []
  return response.data.map(component => ({
    name: component.name || '',
    items: (component.items || []).map(item => ({
      url: item?.media?.url || '',
      des: Array.isArray(item?.descriptions) ? item.descriptions : []
    }))
  }))
}

const getFileListAll = async () => {
  try {
    const response = await getPublicPageComponentsByIds([
      '691ddd42b580fac330cd7ed2',
      '691ddd1bb580fac330cd7ec6',
      '691ddcfdb580fac330cd7eb6',
      '691ddc85b580fac330cd7e4c',
      '691dda95b580fac330cd7d00'
    ])
    componentMediaList.value = mapComponentsToMediaList(response)
    console.log(componentMediaList.value)
  } catch (error) {
    console.error('加载文件列表失败:', error)
    // 静默失败，不显示错误提示，因为Home页面是公开页面，可能未登录
  }
}

onMounted(() => {
  getFileListAll()
})
</script>

<style lang="scss" scoped>
.home {
  margin: 0 auto;
}

// Home 页面特定样式
</style>
