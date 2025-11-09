<template>
  <Header />

  <el-main>
    <div class="header-bg" style="height: 60px"></div>
    <div class="home">
      <Carousel />
      <WelcomeCard :app-info="appStore.appInfo" @click="handleClick" />
      <DescriptionsList :list="descriptionsList" />
      <PicManagement />
      <ClotherMangement />
    </div>

    <LayOut />
  </el-main>

  <Footer />
</template>

<script setup name="Home">
import Carousel from '@/components/carousel.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import WelcomeCard from './components/WelcomeCard.vue'
import DescriptionsList from './components/DescriptionsList.vue'

import PicManagement from './components/PicManagement.vue'
import ClotherMangement from './components/ClotherMangement.vue'

import LayOut from './LayOut/layout.vue'

// Pinia store 已自动导入，无需手动 import
const appStore = useAppStore()

const handleClick = () => {
  ElMessage.success('自动导入功能正常工作！')
}

// 描述列表数据
const descriptionsList = ref(
  Array.from({ length: 10 }, () => ({
    title: 'Vertical list without border',
    column: 4,
    size: 'default',
    direction: 'vertical',
    style: {},
    items: [
      { label: 'Username', content: 'kooriookami' },
      { label: 'Telephone', content: '18100000000' },
      { label: 'Place', content: 'Suzhou', span: 2 },
      {
        label: 'Remarks',
        content: 'School',
        component: 'el-tag',
        props: { size: 'small' }
      },
      {
        label: 'Address',
        content: 'No.1188, Wuzhong Avenue, Wuzhong District, Suzhou, Jiangsu Province'
      }
    ]
  }))
)
</script>

<style lang="scss" scoped>
// Home 页面特定样式
</style>
