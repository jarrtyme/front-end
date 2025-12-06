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
import { getClothingPublicDetail } from '@/api/clothing'
import { DEFAULT_DISPLAY_TYPE } from '@/config/displayType'
import { usePageComponents, getComponentItemsData } from '@/composables/usePageComponents'

const DEFAULT_PAGE_ID = '69184f3ac478e22e4de2698d'

// 路由实例
const route = useRoute()
const router = useRouter()

// 判断是否为服装详情模式
const isClothingDetailMode = computed(() => {
  return !!route.params.id
})

// 存储组件列表
const componentsList = ref([])
const loading = ref(false)
const error = ref('')

// 使用 composable 获取组件过滤器和工具函数
const { headerComponents, footerComponents, contentComponents } = usePageComponents(componentsList)

// 首页模式的页面 ID
const currentPageId = computed(() => {
  return (route.query?.id || '').toString().trim() || DEFAULT_PAGE_ID
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

// 加载服装详情并获取页面ID
const loadClothingPageId = async () => {
  const id = route.params.id
  if (!id) {
    error.value = '缺少服装ID'
    return
  }

  loading.value = true
  error.value = ''
  try {
    const response = await getClothingPublicDetail(id)
    if (response && response.code === 200 && response.data) {
      // 如果绑定了页面，加载页面组件
      if (response.data.pageId) {
        const pageId =
          typeof response.data.pageId === 'object'
            ? response.data.pageId._id || response.data.pageId
            : response.data.pageId
        if (pageId) {
          await loadPageComponents(pageId)
        } else {
          error.value = '服装未绑定页面'
        }
      } else {
        error.value = '服装未绑定页面'
      }
    } else {
      error.value = response?.message || '获取服装详情失败'
    }
  } catch (err) {
    console.error('加载服装详情失败:', err)
    error.value = err?.message || '加载服装详情失败'
    ElMessage.error('加载服装详情失败')
  } finally {
    loading.value = false
  }
}

// 统一的数据加载函数
const loadData = () => {
  if (isClothingDetailMode.value) {
    loadClothingPageId()
  } else {
    loadPageComponents(currentPageId.value)
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听路由变化
watch(
  () => route.params.id,
  () => {
    if (isClothingDetailMode.value) {
      loadClothingPageId()
    }
  }
)

watch(
  currentPageId,
  newId => {
    if (!isClothingDetailMode.value) {
      loadPageComponents(newId)
    }
  },
  { immediate: true }
)

// 初始化
onMounted(() => {
  if (isClothingDetailMode.value) {
    loadClothingPageId()
  } else {
    // 如果访问时没有 id 且存在默认值，保持 URL 一致
    if (!route.query.id && DEFAULT_PAGE_ID) {
      router.replace({ query: { ...route.query, id: DEFAULT_PAGE_ID } })
    }
    loadPageComponents(currentPageId.value)
  }
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
