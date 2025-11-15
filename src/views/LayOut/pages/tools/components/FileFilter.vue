<template>
  <div class="filter-group">
    <el-radio-group :model-value="filterType" @change="handleFilterChange">
      <el-radio-button label="">全部</el-radio-button>
      <el-radio-button label="image">图片</el-radio-button>
      <el-radio-button label="video">视频</el-radio-button>
      <el-radio-button label="document">文档</el-radio-button>
      <el-radio-button label="archive">压缩包</el-radio-button>
      <el-radio-button label="text">文本</el-radio-button>
      <el-radio-button label="other">其他</el-radio-button>
    </el-radio-group>
    <el-input
      :model-value="descriptionSearch"
      placeholder="搜索描述..."
      clearable
      style="width: 200px; margin-left: 16px"
      @clear="handleClear"
      @keydown.enter.prevent="handleSearch"
      @update:model-value="handleInputChange"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  filterType: {
    type: String,
    default: ''
  },
  descriptionSearch: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['filter-change', 'search', 'clear', 'input-change'])

const handleFilterChange = value => {
  emit('filter-change', value)
}

const handleSearch = event => {
  emit('search', event)
}

const handleClear = () => {
  emit('clear')
}

const handleInputChange = value => {
  emit('input-change', value)
}
</script>

<style lang="scss" scoped>
.filter-group {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 400px;
  flex-wrap: wrap;
  gap: 12px;

  :deep(.el-radio-group) {
    flex: 1;
    min-width: 300px;
  }
}
</style>
