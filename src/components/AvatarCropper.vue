<template>
  <ModernDialog
    v-model="visible"
    title="头像裁剪"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="avatar-cropper-container">
      <vue-picture-cropper
        :boxStyle="{
          width: '100%',
          height: '400px',
          backgroundColor: '#f8f8f8',
          margin: 'auto'
        }"
        :img="imageSrc"
        :options="cropperOptions"
        @ready="onReady"
      />
      <div class="cropper-controls">
        <el-button-group>
          <el-button :icon="RefreshLeft" @click="rotateLeft">左旋转</el-button>
          <el-button :icon="RefreshRight" @click="rotateRight">右旋转</el-button>
          <el-button :icon="ZoomIn" @click="zoomIn">放大</el-button>
          <el-button :icon="ZoomOut" @click="zoomOut">缩小</el-button>
          <el-button :icon="Refresh" @click="reset">重置</el-button>
        </el-button-group>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="cropping" @click="handleCrop">确定</el-button>
    </template>
  </ModernDialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshLeft, RefreshRight, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import ModernDialog from '@/components/ModernDialog.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  imageSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'crop', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const cropping = ref(false)
const isReady = ref(false)

// Cropper 配置选项
const cropperOptions = {
  viewMode: 1, // 限制裁剪框不能超出画布
  dragMode: 'move', // 拖动模式：move 移动图片，crop 创建新的裁剪框
  // aspectRatio 不设置，允许自由比例裁剪
  cropBoxResizable: true, // 允许调整裁剪框大小
  cropBoxMovable: true, // 允许移动裁剪框
  toggleDragModeOnDblclick: false, // 禁用双击切换拖动模式
  autoCropArea: 0.8, // 自动裁剪区域占图片的比例
  restore: false, // 禁用恢复
  guides: true, // 显示裁剪框的辅助线
  center: true, // 居中裁剪框
  highlight: true, // 高亮显示裁剪框
  background: true, // 显示网格背景
  modal: true // 显示遮罩层
}

// Cropper 准备就绪回调
const onReady = () => {
  isReady.value = true
}

// 左旋转
const rotateLeft = () => {
  if (!isReady.value) {
    ElMessage.warning('裁剪器未准备好')
    return
  }
  cropper.rotate(-90)
}

// 右旋转
const rotateRight = () => {
  if (!isReady.value) {
    ElMessage.warning('裁剪器未准备好')
    return
  }
  cropper.rotate(90)
}

// 放大
const zoomIn = () => {
  if (!isReady.value) {
    ElMessage.warning('裁剪器未准备好')
    return
  }
  cropper.zoom(0.1)
}

// 缩小
const zoomOut = () => {
  if (!isReady.value) {
    ElMessage.warning('裁剪器未准备好')
    return
  }
  cropper.zoom(-0.1)
}

// 重置
const reset = () => {
  if (!isReady.value) {
    ElMessage.warning('裁剪器未准备好')
    return
  }
  cropper.reset()
}

// 裁剪并获取结果
const handleCrop = () => {
  if (!isReady.value) {
    ElMessage.error('裁剪器未准备好，请稍候')
    return
  }

  try {
    cropping.value = true

    // 获取裁剪后的 canvas（不指定宽高，使用裁剪框的实际尺寸，支持自由比例）
    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })

    if (!canvas) {
      ElMessage.error('裁剪失败，请重试')
      cropping.value = false
      return
    }

    // 将 canvas 转换为 blob
    canvas.toBlob(
      blob => {
        if (!blob) {
          ElMessage.error('生成图片失败')
          cropping.value = false
          return
        }

        // 创建 File 对象
        const file = new File([blob], `avatar_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })

        // 生成预览 URL
        const previewUrl = URL.createObjectURL(blob)

        // 获取 base64 数据
        const dataURL = canvas.toDataURL('image/jpeg', 0.9)

        // 触发 crop 事件，传递裁剪结果
        emit('crop', {
          file,
          blob,
          previewUrl,
          dataURL
        })

        cropping.value = false
        handleClose()
      },
      'image/jpeg',
      0.9 // 图片质量 0-1
    )
  } catch (error) {
    console.error('裁剪失败:', error)
    ElMessage.error('裁剪失败: ' + (error.message || '未知错误'))
    cropping.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  isReady.value = false
  emit('close')
}
</script>

<style lang="scss" scoped>
.avatar-cropper-container {
  .cropper-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
}
</style>
