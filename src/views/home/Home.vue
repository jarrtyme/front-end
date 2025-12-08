<template>
  <div v-loading="loading" class="home-container">
    <!-- 页面组件显示 -->
    <div v-if="componentsList.length > 0" class="page-components-container">
      <template v-if="headerComponents.length">
        <Header
          v-for="component in headerComponents"
          :key="component._id || component.name"
          :items="getComponentItemsData(component)"
          :link="component.link"
        />
      </template>

      <div class="home">
        <DynamicComponentRenderer :components="contentComponents" />
      </div>

      <template v-if="footerComponents.length">
        <Footer
          v-for="component in footerComponents"
          :key="component._id || component.name"
          :items="getComponentItemsData(component)"
          :link="component.link"
        />
      </template>
      <Footer v-else />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!loading && error" class="error-state">
      <el-result icon="error" title="加载失败" :sub-title="error">
        <template #extra>
          <el-button type="primary" @click="loadData">重试</el-button>
          <el-button @click="goBack">返回</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup name="Home">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Header from '@/views/Home/components/Header.vue'
import Footer from '@/views/Home/components/Footer.vue'
import DynamicComponentRenderer from '@/views/Home/components/DynamicComponentRenderer.vue'
import { getPublicPageById } from '@/api/page'
import { DEFAULT_DISPLAY_TYPE } from '@/config/displayType'
import { usePageComponents, getComponentItemsData } from '@/composables/usePageComponents'

const DEFAULT_PAGE_ID = 'home'

// 路由实例
const route = useRoute()
const router = useRouter()

// 判断是否为页面详情模式（/pageid/:id）
const isPageDetailMode = computed(() => {
  return route.name === 'PageDetail' && !!route.params.id
})

// 存储组件列表
const componentsList = ref([])
const loading = ref(false)
const error = ref('')

// 使用 composable 获取组件过滤器和工具函数
const { headerComponents, footerComponents, contentComponents } = usePageComponents(componentsList)

// 获取当前页面 ID
// 根目录（/）默认使用 'home'
// /pageid/:id 使用路由参数中的 id
const currentPageId = computed(() => {
  if (isPageDetailMode.value) {
    // 页面详情模式，使用路由参数中的 id
    return route.params.id?.toString().trim() || ''
  }
  // 根目录，默认使用 'home'
  return DEFAULT_PAGE_ID
})

// 加载页面组件数据
const loadPageComponents = async pageId => {
  if (!pageId) {
    componentsList.value = []
    error.value = '缺少页面ID'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await getPublicPageById(pageId)
    if (response && response.code === 200 && response.data) {
      componentsList.value = (response.data.componentIds || []).map(component => ({
        _id: component._id?.toString() || component._id,
        name: component.name || '',
        displayType: component.displayType || DEFAULT_DISPLAY_TYPE,
        order: component.order ?? 0,
        isActive: component.isActive !== false,
        items: Array.isArray(component.items) ? component.items : [],
        widthMode: component.widthMode || 'wide',
        link:
          component.link && typeof component.link === 'string' && component.link.trim()
            ? component.link.trim()
            : ''
      }))
    } else {
      componentsList.value = []
      error.value = response?.message || '未找到对应页面配置'
    }
  } catch (err) {
    console.error('加载页面组件失败:', err)
    componentsList.value = []
    error.value = err?.message || '加载页面组件失败'
  } finally {
    loading.value = false
  }
}

// 统一的数据加载函数
const loadData = () => {
  // 页面详情模式或根目录，加载页面组件
  if (isPageDetailMode.value || route.name === 'Home') {
    const pageId = currentPageId.value
    if (pageId) {
      loadPageComponents(pageId)
    } else {
      error.value = '缺少页面ID'
    }
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听路由变化
watch(
  () => [route.name, route.params.id],
  () => {
    if (isPageDetailMode.value || route.name === 'Home') {
      const pageId = currentPageId.value
      if (pageId) {
        loadPageComponents(pageId)
      }
    }
  },
  { immediate: false }
)

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: calc(100vh - 200px);
  margin: 0 auto;
}

.home {
  margin: 0 auto;
}

.page-components-container {
  width: 100%;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
</style>
