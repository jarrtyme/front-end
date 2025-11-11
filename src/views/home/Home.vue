<template>
  <Header />

  <el-main>
    <div class="header-bg" style="height: 60px"></div>
    <div class="home">
      <Carousel />
      <VideoPlayer
        src="https://www.apple.com/105/media/us/macbook-pro/2025/785e1bc4-d1bd-4cf4-b1b3-94b9411c9e74/anim/performance-chip-background/medium.mp4"
      />

      <!-- height: 400px;
  width: min(max(calc(87.5vw - 0px), 320px), 1260px);
  width: calc(calc(min(max(87.5vw - 0px, 280px), 1260px) - 20px * 1) * 0.5);
  width: calc(calc(min(calc(max(87.5vw - 0px, 280px), 280px) -20px), 420px)-20px * 0 * 1);
   -->
      <ScrollSnapCarousel
        :items="items"
        :height="400"
        :itemWidth="`calc(calc(min(max(87.5vw - 0px, 280px), 1260px) - 20px * 1) * 0.5)`"
        :gap="20"
        :showArrows="true"
        :showIndicators="false"
        :snapAlign="start"
      />
    </div>
  </el-main>

  <Footer />
</template>

<script setup name="Home">
import Carousel from '@/components/Carousel.vue'
import ImageCarousel from '@/components/ImageCarousel.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'
import ScrollSnapCarousel from '@/components/ScrollSnapCarousel.vue'

import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const items = [
  {
    url: 'https://www.apple.com/v/ipad-air/ae/images/overview/closer-look/all-colors/slide_1A__fg52jvpudo6e_medium_2x.jpg'
  },
  {
    url: 'http://localhost:3000/uploads/images/jimeng-2025-11-03-7385-%C3%A7%C2%94%C2%9F%C3%A6%C2%88%C2%90%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A8%C2%87%C2%AA%C3%A5%C2%8A%C2%A8%C3%A5%C2%8C%C2%96%C3%A8%C2%A3%C2%81%C3%A5%C2%89%C2%AA%C3%A6%C2%9C%C2%8D%C3%A8%C2%A3%C2%85%C3%A7%C2%9B%C2%B8%C3%A5%C2%85%C2%B3%C3%A7%C2%9A%C2%84%C3%A5%C2%9B%C2%BE%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A5%C2%A4%C2%B4%C3%A5%C2%8F%C2%AA%C3%A6%C2%9C%C2%89%C3%A4%C2%B8%C2%80%C3%A4%C2%B8%C2%AA%C3%A6%C2%98%C2%AF%C3%A4%C2%B8%C2%8A%C3%A4%C2%B8%C2%8B%C3%A7%C2%A7%C2%BB%C3%A5%C2%8A%C2%A8%C3%A7%C2%9A%C2%84%C3%A7%C2%BB%C2%86%C3%A9%C2%95%C2%BF%C3%A5%C2%88%C2%80%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A5%C2%B8%C2%83%C3%A6%C2%96%C2%99%C3%A8%C2%A2%C2%AB%C3%A6%C2%8A%C2%BD%C3%A7%C2%9C%C2%9F..._1762793539769_81314762.png'
  },
  {
    url: 'http://localhost:3000/uploads/images/jimeng-2025-11-03-7385-%C3%A7%C2%94%C2%9F%C3%A6%C2%88%C2%90%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A8%C2%87%C2%AA%C3%A5%C2%8A%C2%A8%C3%A5%C2%8C%C2%96%C3%A8%C2%A3%C2%81%C3%A5%C2%89%C2%AA%C3%A6%C2%9C%C2%8D%C3%A8%C2%A3%C2%85%C3%A7%C2%9B%C2%B8%C3%A5%C2%85%C2%B3%C3%A7%C2%9A%C2%84%C3%A5%C2%9B%C2%BE%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A5%C2%A4%C2%B4%C3%A5%C2%8F%C2%AA%C3%A6%C2%9C%C2%89%C3%A4%C2%B8%C2%80%C3%A4%C2%B8%C2%AA%C3%A6%C2%98%C2%AF%C3%A4%C2%B8%C2%8A%C3%A4%C2%B8%C2%8B%C3%A7%C2%A7%C2%BB%C3%A5%C2%8A%C2%A8%C3%A7%C2%9A%C2%84%C3%A7%C2%BB%C2%86%C3%A9%C2%95%C2%BF%C3%A5%C2%88%C2%80%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A5%C2%B8%C2%83%C3%A6%C2%96%C2%99%C3%A8%C2%A2%C2%AB%C3%A6%C2%8A%C2%BD%C3%A7%C2%9C%C2%9F..._1762793539769_81314762.png'
  },
  {
    url: 'http://localhost:3000/uploads/images/jimeng-2025-11-03-7385-%C3%A7%C2%94%C2%9F%C3%A6%C2%88%C2%90%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A8%C2%87%C2%AA%C3%A5%C2%8A%C2%A8%C3%A5%C2%8C%C2%96%C3%A8%C2%A3%C2%81%C3%A5%C2%89%C2%AA%C3%A6%C2%9C%C2%8D%C3%A8%C2%A3%C2%85%C3%A7%C2%9B%C2%B8%C3%A5%C2%85%C2%B3%C3%A7%C2%9A%C2%84%C3%A5%C2%9B%C2%BE%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A5%C2%A4%C2%B4%C3%A5%C2%8F%C2%AA%C3%A6%C2%9C%C2%89%C3%A4%C2%B8%C2%80%C3%A4%C2%B8%C2%AA%C3%A6%C2%98%C2%AF%C3%A4%C2%B8%C2%8A%C3%A4%C2%B8%C2%8B%C3%A7%C2%A7%C2%BB%C3%A5%C2%8A%C2%A8%C3%A7%C2%9A%C2%84%C3%A7%C2%BB%C2%86%C3%A9%C2%95%C2%BF%C3%A5%C2%88%C2%80%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A5%C2%B8%C2%83%C3%A6%C2%96%C2%99%C3%A8%C2%A2%C2%AB%C3%A6%C2%8A%C2%BD%C3%A7%C2%9C%C2%9F..._1762793539769_81314762.png'
  },
  {
    url: 'http://localhost:3000/uploads/images/jimeng-2025-11-03-7385-%C3%A7%C2%94%C2%9F%C3%A6%C2%88%C2%90%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A8%C2%87%C2%AA%C3%A5%C2%8A%C2%A8%C3%A5%C2%8C%C2%96%C3%A8%C2%A3%C2%81%C3%A5%C2%89%C2%AA%C3%A6%C2%9C%C2%8D%C3%A8%C2%A3%C2%85%C3%A7%C2%9B%C2%B8%C3%A5%C2%85%C2%B3%C3%A7%C2%9A%C2%84%C3%A5%C2%9B%C2%BE%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A5%C2%A4%C2%B4%C3%A5%C2%8F%C2%AA%C3%A6%C2%9C%C2%89%C3%A4%C2%B8%C2%80%C3%A4%C2%B8%C2%AA%C3%A6%C2%98%C2%AF%C3%A4%C2%B8%C2%8A%C3%A4%C2%B8%C2%8B%C3%A7%C2%A7%C2%BB%C3%A5%C2%8A%C2%A8%C3%A7%C2%9A%C2%84%C3%A7%C2%BB%C2%86%C3%A9%C2%95%C2%BF%C3%A5%C2%88%C2%80%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A5%C2%B8%C2%83%C3%A6%C2%96%C2%99%C3%A8%C2%A2%C2%AB%C3%A6%C2%8A%C2%BD%C3%A7%C2%9C%C2%9F..._1762793539769_81314762.png'
  },
  {
    url: 'http://localhost:3000/uploads/images/jimeng-2025-11-03-7385-%C3%A7%C2%94%C2%9F%C3%A6%C2%88%C2%90%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A8%C2%87%C2%AA%C3%A5%C2%8A%C2%A8%C3%A5%C2%8C%C2%96%C3%A8%C2%A3%C2%81%C3%A5%C2%89%C2%AA%C3%A6%C2%9C%C2%8D%C3%A8%C2%A3%C2%85%C3%A7%C2%9B%C2%B8%C3%A5%C2%85%C2%B3%C3%A7%C2%9A%C2%84%C3%A5%C2%9B%C2%BE%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A6%C2%9C%C2%BA%C3%A5%C2%99%C2%A8%C3%A5%C2%A4%C2%B4%C3%A5%C2%8F%C2%AA%C3%A6%C2%9C%C2%89%C3%A4%C2%B8%C2%80%C3%A4%C2%B8%C2%AA%C3%A6%C2%98%C2%AF%C3%A4%C2%B8%C2%8A%C3%A4%C2%B8%C2%8B%C3%A7%C2%A7%C2%BB%C3%A5%C2%8A%C2%A8%C3%A7%C2%9A%C2%84%C3%A7%C2%BB%C2%86%C3%A9%C2%95%C2%BF%C3%A5%C2%88%C2%80%C3%A7%C2%89%C2%87%C3%AF%C2%BC%C2%8C%C3%A5%C2%B8%C2%83%C3%A6%C2%96%C2%99%C3%A8%C2%A2%C2%AB%C3%A6%C2%8A%C2%BD%C3%A7%C2%9C%C2%9F..._1762793539769_81314762.png'
  }
]
</script>

<style lang="scss" scoped>
// Home 页面特定样式
</style>
