<template>
  <div class="action-buttons">
    <el-button
      v-if="selectedFiles.length > 0 && canBatchAddToLibrary"
      type="success"
      :icon="Plus"
      @click="handleBatchAddToLibrary"
      :loading="batchAddingToLibrary"
    >
      批量添加到媒体库 ({{ selectedFilesNotInLibrary.length }})
    </el-button>
    <el-button
      v-if="selectedFiles.length > 0 && canBatchAddDescription"
      type="primary"
      :icon="Plus"
      @click="handleOpenBatchDescriptionDialog"
      :loading="batchAddingDescription"
    >
      批量添加描述 ({{ selectedFilesInLibrary.length }})
    </el-button>
    <el-button
      v-if="selectedFiles.length > 0"
      type="danger"
      :icon="Delete"
      @click="handleBatchDelete"
      :loading="batchDeleting"
    >
      批量删除 ({{ selectedFiles.length }})
    </el-button>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  selectedFiles: {
    type: Array,
    default: () => []
  },
  batchDeleting: {
    type: Boolean,
    default: false
  },
  batchAddingToLibrary: {
    type: Boolean,
    default: false
  },
  batchAddingDescription: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['batch-delete', 'batch-add-to-library', 'open-batch-description-dialog'])

// 计算选中的未添加到媒体库的文件（所有文件类型）
const selectedFilesNotInLibrary = computed(() => {
  return props.selectedFiles.filter(file => !file.isAddedToLibrary)
})

// 计算选中的已添加到媒体库的文件（所有文件类型）
const selectedFilesInLibrary = computed(() => {
  return props.selectedFiles.filter(file => file.isAddedToLibrary && file.mediaId)
})

// 是否可以批量添加到媒体库
const canBatchAddToLibrary = computed(() => {
  return selectedFilesNotInLibrary.value.length > 0
})

// 是否可以批量添加描述
const canBatchAddDescription = computed(() => {
  return selectedFilesInLibrary.value.length > 0
})

const handleBatchDelete = () => {
  emit('batch-delete')
}

const handleBatchAddToLibrary = () => {
  emit('batch-add-to-library')
}

const handleOpenBatchDescriptionDialog = () => {
  emit('open-batch-description-dialog')
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
