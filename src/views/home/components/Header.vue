<template>
  <el-header>
    <div class="header-container">
      <el-button v-if="!isHomePage" class="back-button" circle @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="header-menu-text">
        <h3 v-for="(line, index) in headerLines" :key="index">{{ line }}</h3>
        <!-- <el-link v-if="displayLink" :href="displayLink" target="_blank" class="header-link">
        {{ displayLinkText }}
      </el-link> -->
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

defineOptions({
  name: 'Header'
})

const router = useRouter()
const route = useRoute()

const isHomePage = computed(() => {
  return route.path === '/' || route.name === 'Home'
})

const goBack = () => {
  router.back()
}

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  link: {
    type: String,
    default: ''
  }
})

const DEFAULT_HEADER_LINES = ['每日穿搭，都是对生活的告白']

const extractDescriptions = item => {
  if (!item) return []
  const list = Array.isArray(item.descriptions) ? item.descriptions : item.des || []
  return list.map(desc => (typeof desc === 'string' ? desc : desc?.text)).filter(Boolean)
}

const headerLines = computed(() => {
  const firstItem = props.items?.[0]
  const descriptions = extractDescriptions(firstItem)
  if (descriptions.length > 0) {
    return descriptions
  }
  const fallbackName = firstItem?.name || firstItem?.media?.filename
  return fallbackName ? [fallbackName] : DEFAULT_HEADER_LINES
})

// 统一使用 link 字段
const displayLink = computed(() => {
  return props.link && typeof props.link === 'string' && props.link.trim() ? props.link.trim() : ''
})
const displayLinkText = computed(() => props.items?.[0]?.media?.filename || '了解更多')
</script>

<style lang="scss" scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: var(--el-header-height-1);
}

.back-button {
  position: absolute;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: translateX(-2px);
  }

  &:active {
    transform: translateX(0);
  }
}

.header-menu-text {
  backdrop-filter: saturate(180%) blur(20px);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-bottom: rgb(0, 0, 0);
  position: sticky;
  font-weight: 600;
  top: 0;
  z-index: 10;

  height: var(--el-header-height-1);
  h3 {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin: 0;
  }
}

.header-link {
  margin-top: 8px;
}
</style>
