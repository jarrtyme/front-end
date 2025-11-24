<template>
  <ModernDialog
    :model-value="visible"
    :title="title"
    :confirm-text="confirmText"
    :confirm-loading="loading"
    @confirm="handleConfirm"
    @close="handleClose"
    @update:model-value="handleUpdateVisible"
  >
    <div v-if="isBatch" class="batch-description-container">
      <el-alert type="info" :closable="false" style="margin-bottom: 16px">
        将为选中的 {{ fileCount }} 个文件批量添加以下描述
      </el-alert>
      <div v-for="(desc, index) in localDescriptions" :key="index" class="description-item">
        <el-input
          v-model="desc.text"
          type="textarea"
          :rows="2"
          placeholder="请输入描述内容"
          maxlength="500"
          show-word-limit
          class="description-input"
        />
        <el-button
          type="danger"
          :icon="Delete"
          circle
          size="small"
          @click="handleRemoveItem(index)"
          class="description-delete-btn"
          :disabled="localDescriptions.length <= 1"
        />
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAddItem" class="add-description-btn">
        添加描述
      </el-button>
    </div>
    <div v-else class="descriptions-manage-container">
      <div
        v-for="(desc, index) in localDescriptions"
        :key="desc._id || index"
        class="description-item"
      >
        <el-input
          v-model="desc.text"
          type="textarea"
          :rows="2"
          placeholder="请输入描述内容"
          maxlength="500"
          show-word-limit
          class="description-input"
        />
        <el-button
          type="danger"
          :icon="Delete"
          circle
          size="small"
          @click="handleRemoveItem(index)"
          class="description-delete-btn"
        />
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAddItem" class="add-description-btn">
        添加描述
      </el-button>
    </div>
  </ModernDialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import ModernDialog from '@/components/ModernDialog.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '管理描述'
  },
  confirmText: {
    type: String,
    default: '保存'
  },
  loading: {
    type: Boolean,
    default: false
  },
  descriptions: {
    type: Array,
    default: () => []
  },
  isBatch: {
    type: Boolean,
    default: false
  },
  fileCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['confirm', 'close', 'update:model-value'])

const localDescriptions = ref([])

// 只在 visible 变化时初始化 localDescriptions，避免循环更新
watch(
  () => props.visible,
  isVisible => {
    if (isVisible) {
      // 对话框打开时，从 props 初始化本地状态
      if (props.isBatch) {
        localDescriptions.value = props.descriptions.length
          ? props.descriptions.map(desc => ({ text: desc.text || '' }))
          : [{ text: '' }]
      } else {
        // 非批量模式：如果有描述则使用，否则至少保留一个空项
        if (props.descriptions.length > 0) {
          localDescriptions.value = props.descriptions.map(desc => ({
            _id: desc._id,
            text: desc.text || '',
            createdAt: desc.createdAt
          }))
        } else {
          // 如果没有描述，至少保留一个空项供用户输入
          localDescriptions.value = [
            {
              _id: null,
              text: '',
              createdAt: new Date()
            }
          ]
        }
      }
    } else {
      // 对话框关闭时，清空本地状态
      localDescriptions.value = []
    }
  },
  { immediate: true }
)

const handleAddItem = () => {
  if (props.isBatch) {
    localDescriptions.value.push({ text: '' })
  } else {
    localDescriptions.value.push({
      _id: null,
      text: '',
      createdAt: new Date()
    })
  }
}

const handleRemoveItem = index => {
  if (props.isBatch && localDescriptions.value.length <= 1) {
    return
  }
  localDescriptions.value.splice(index, 1)
}

const handleConfirm = () => {
  emit('confirm', localDescriptions.value)
}

const handleClose = () => {
  emit('close')
  emit('update:model-value', false)
}

const handleUpdateVisible = value => {
  emit('update:model-value', value)
}
</script>

<style lang="scss" scoped>
.descriptions-manage-container,
.batch-description-container {
  .description-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;

    .description-input {
      flex: 1;
    }

    .description-delete-btn {
      margin-top: 4px;
      flex-shrink: 0;
    }
  }

  .add-description-btn {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
