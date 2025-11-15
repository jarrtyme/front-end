<template>
  <ModernDialog
    :model-value="visible"
    :title="title"
    width="800px"
    @update:model-value="handleUpdateVisible"
    @close="handleClose"
  >
    <template #footer>
      <div></div>
    </template>
    <div class="video-preview-container">
      <video :src="videoUrl" controls autoplay style="width: 100%; max-height: 70vh">
        您的浏览器不支持视频播放
      </video>
    </div>
  </ModernDialog>
</template>

<script setup>
import ModernDialog from '@/components/ModernDialog.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '视频预览'
  },
  videoUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'update:model-value'])

const handleClose = () => {
  emit('close')
  emit('update:model-value', false)
}

const handleUpdateVisible = value => {
  emit('update:model-value', value)
  if (!value) {
    emit('close')
  }
}
</script>

<style lang="scss" scoped>
.video-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}
</style>
