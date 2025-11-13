<template>
  <Header />

  <el-main>
    <div
      class="header-bg"
      style="height: var(--el-header-height-1); background-color: rgba(255, 255, 255, 0.8)"
    ></div>
    <div class="home">
      <Carousel :items="items" />
      <VideoPlayer
        src="https://www.apple.com/105/media/us/macbook-pro/2025/785e1bc4-d1bd-4cf4-b1b3-94b9411c9e74/anim/performance-chip-background/medium.mp4"
        text="MacBook Pro"
      />

      <ImageCarousel :items="items" />

      <ScrollSnapCarousel
        :items="items"
        :height="400"
        :itemWidth="`calc(min(max(87.5vw, 280px) - 20px, 420px))`"
        :gap="20"
        :showArrows="true"
        :showIndicators="false"
        snapAlign="start"
      />

      <Desccard :items="items" />
      <Bigner :items="items" />
      <SeamlessCarousel :items="items" />
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

const items = [
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/å¾®ä¿¡å¾ç_20251111174251_10_255_1763054370415_3405086.jpg'
  }
]
</script>

<style lang="scss" scoped>
.home {
  margin: 0 auto;
}
// Home 页面特定样式
</style>
