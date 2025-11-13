<template>
  <Header />

  <el-main>
    <div
      class="header-bg"
      style="height: var(--el-header-height-1); background-color: rgba(255, 255, 255, 0.8)"
    ></div>
    <div class="home">
      <Carousel :items="items.items1" />
      <VideoPlayer
        src="https://www.apple.com/105/media/us/macbook-pro/2025/785e1bc4-d1bd-4cf4-b1b3-94b9411c9e74/anim/performance-chip-background/medium.mp4"
        text="MacBook Pro"
      />

      <ImageCarousel :items="items.items2" />

      <ScrollSnapCarousel
        :items="items.items3"
        :height="400"
        :itemWidth="`calc(min(max(87.5vw, 280px) - 20px, 420px))`"
        :gap="20"
        :showArrows="true"
        :showIndicators="false"
        snapAlign="start"
      />

      <Desccard :items="items.items4" />
      <Bigner :items="items.items5" />
      <SeamlessCarousel :items="items.items6" />
    </div>
  </el-main>

  <Footer />
</template>

<script setup name="Home">
import Carousel from '@/views/Home/components/Carousel.vue'
import ImageCarousel from '@/views/Home/components/ImageCarousel.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ScrollSnapCarousel from '@/views/Home/components/ScrollSnapCarousel.vue'
import SeamlessCarousel from '@/views/Home/components/SeamlessCarousel.vue'
import Desccard from '@/views/Home/components/Desccard.vue'
import Bigner from '@/views/Home/components/Bigner.vue'
import Header from '@/views/Home/components/Header.vue'
import Footer from '@/views/Home/components/Footer.vue'
import { getFileList } from '@/api/upload'

const items = ref({
  items1: [],
  items2: [],
  items3: [],
  items4: [],
  items5: [],
  items6: []
})

const getFileListAll = async () => {
  const [res1, res2, res3, res4, res5, res6] = await Promise.all([
    getFileList({
      page: 1,
      limit: 10,
      description: 'items1'
    }),
    getFileList({
      page: 1,
      limit: 10,
      description: 'items2'
    }),
    getFileList({
      page: 1,
      limit: 10,
      description: 'items3'
    }),
    getFileList({
      page: 1,
      limit: 10,
      description: 'items4'
    }),
    getFileList({
      page: 1,
      limit: 10,
      description: 'items5'
    }),
    getFileList({
      page: 1,
      limit: 10,
      description: 'items6'
    })
  ])

  items.value.items1 = res1.data.files
  items.value.items2 = res2.data.files
  items.value.items3 = res3.data.files
  items.value.items4 = res4.data.files
  items.value.items5 = res5.data.files
  items.value.items6 = res6.data.files
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
