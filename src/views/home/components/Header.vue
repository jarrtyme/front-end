<template>
  <el-header>
    <div class="header-menu-text">
      <h3 v-for="(line, index) in headerLines" :key="index">{{ line }}</h3>
      <!-- <el-link v-if="displayLink" :href="displayLink" target="_blank" class="header-link">
      {{ displayLinkText }}
    </el-link> -->
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'Header'
})

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

const displayLink = computed(() => props.link || props.items?.[0]?.media?.url || '')
const displayLinkText = computed(() => props.items?.[0]?.media?.filename || '了解更多')
</script>

<style lang="scss" scoped>
.header-menu-text {
  backdrop-filter: saturate(180%) blur(20px);
  width: auto;
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
