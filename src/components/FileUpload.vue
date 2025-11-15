<template>
  <el-upload
    ref="uploadRef"
    class="file-upload"
    :class="{ 'upload-drag': drag, 'avatar-uploader': listType === 'avatar' }"
    :drag="drag"
    :http-request="handleUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :before-upload="beforeUpload"
    :limit="maxCount"
    :multiple="multiple"
    :accept="computedAccept"
    :disabled="disabled"
    :show-file-list="showFileList"
    :list-type="listType"
    :file-list="fileList"
    :on-remove="handleRemove"
  >
    <template v-if="drag">
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">{{ uploadText }}，或<em>点击上传</em></div>
    </template>
    <template v-else-if="listType === 'picture-card'">
      <el-icon><Plus /></el-icon>
      <div class="upload-tip" v-if="uploadText"><span v-html="uploadText"></span></div>
    </template>
    <template v-else-if="listType === 'avatar'">
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </template>
    <template v-else>
      <el-button type="primary" :icon="UploadFilled" :disabled="disabled">
        {{ buttonText }}
      </el-button>
    </template>
    <template #tip v-if="computedTip">
      <div class="el-upload__tip">{{ computedTip }}</div>
    </template>
  </el-upload>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Plus } from '@element-plus/icons-vue'
import { uploadFiles } from '@/api/upload'

const props = defineProps({
  // 文件类型限制：'image' | 'video' | 'document' | 'all'
  fileType: {
    type: String,
    default: 'all',
    validator: value => ['image', 'video', 'document', 'all'].includes(value)
  },
  // 文件大小限制（MB）
  maxSize: {
    type: Number,
    default: 100
  },
  // 文件数量限制
  maxCount: {
    type: Number,
    default: 200
  },
  // 是否支持多文件上传
  multiple: {
    type: Boolean,
    default: true
  },
  // 是否支持拖拽
  drag: {
    type: Boolean,
    default: true
  },
  // accept属性
  accept: {
    type: String,
    default: ''
  },
  // 提示文本
  tip: {
    type: String,
    default: ''
  },
  // 上传文本（拖拽模式）
  uploadText: {
    type: String,
    default: '将文件拖到此处'
  },
  // 按钮文本（非拖拽模式）
  buttonText: {
    type: String,
    default: '选择文件'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示文件列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 列表类型：'text' | 'picture' | 'picture-card' | 'avatar'
  listType: {
    type: String,
    default: 'text',
    validator: value => ['text', 'picture', 'picture-card', 'avatar'].includes(value)
  },
  // 文件列表（用于picture-card模式）
  fileList: {
    type: Array,
    default: () => []
  },
  // 头像URL（用于avatar模式）
  avatarUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['success', 'error', 'before-upload', 'remove'])

const uploadRef = ref(null)
// 用于跟踪已触发成功事件的文件，防止重复触发
const successEmittedFiles = new Set()
// 上传队列：用于批量上传
const uploadQueue = ref([])
const isUploading = ref(false)
const uploadTimer = ref(null)
// 当前上传批次ID
const currentBatchId = ref(null)

// 文件类型验证规则
const fileTypeRules = {
  image: {
    mimeTypes: ['image/'],
    extensions:
      /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff|tif|heic|heif|avif|jfif|jp2|jpx|j2k|j2c|psd|raw|cr2|nef|orf|sr2)$/i,
    accept: 'image/*',
    defaultTip: `支持 jpg/png/gif/webp/bmp/svg/ico/tiff/heic/avif 等多种图片格式，文件大小不超过 ${props.maxSize}MB，最多${props.maxCount}个`
  },
  video: {
    mimeTypes: ['video/'],
    extensions: /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i,
    accept: 'video/*',
    defaultTip: `支持 mp4/webm/ogg/mov/avi/wmv/flv/mkv 格式的视频文件，文件大小不超过 ${props.maxSize}MB，最多${props.maxCount}个`
  },
  document: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd'],
    extensions: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    defaultTip: `支持 pdf/doc/docx/xls/xlsx/ppt/pptx 格式的文档文件，文件大小不超过 ${props.maxSize}MB，最多${props.maxCount}个`
  },
  all: {
    mimeTypes: [],
    extensions:
      /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tiff|tif|heic|heif|avif|jfif|jp2|jpx|j2k|j2c|psd|raw|cr2|nef|orf|sr2|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|txt|csv|json|xml|md|mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i,
    accept: '',
    defaultTip: `支持多种文件类型：图片、视频、文档、压缩包、文本文件，文件大小不超过 ${props.maxSize}MB，最多${props.maxCount}个`
  }
}

// 计算accept属性
const computedAccept = computed(() => {
  if (props.accept) {
    return props.accept
  }
  const rule = fileTypeRules[props.fileType]
  return rule ? rule.accept : ''
})

// 计算提示文本
const computedTip = computed(() => {
  if (props.tip) {
    return props.tip
  }
  const rule = fileTypeRules[props.fileType]
  return rule ? rule.defaultTip : ''
})

// 上传前验证
const beforeUpload = file => {
  const rule = fileTypeRules[props.fileType]

  // 文件大小验证
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  // 文件类型验证
  if (props.fileType !== 'all' && rule) {
    // 检查MIME类型
    const isValidMimeType = rule.mimeTypes.some(mime => file.type.startsWith(mime))
    // 检查扩展名
    const isValidExtension = rule.extensions.test(file.name)

    if (!isValidMimeType && !isValidExtension) {
      const typeName =
        {
          image: '图片',
          video: '视频',
          document: '文档'
        }[props.fileType] || '文件'
      ElMessage.error(`只能上传${typeName}文件!`)
      return false
    }
  } else if (props.fileType === 'all' && rule) {
    // 所有文件类型，检查扩展名
    if (!rule.extensions.test(file.name)) {
      ElMessage.error('不支持的文件类型！允许的类型：图片、视频、文档、压缩包、文本文件')
      return false
    }
  }

  // 如果是多文件上传，生成批次ID（第一次选择文件时）
  if (props.multiple && !currentBatchId.value) {
    currentBatchId.value = Date.now()
  }

  // 触发before-upload事件
  emit('before-upload', file)
  return true
}

// 处理上传
const handleUpload = async options => {
  const { file, onSuccess, onError } = options

  // 如果是多文件上传且有批次ID，将文件加入队列，延迟批量上传
  if (props.multiple && currentBatchId.value) {
    uploadQueue.value.push({ file, onSuccess, onError, batchId: currentBatchId.value })

    // 清除之前的定时器
    if (uploadTimer.value) {
      clearTimeout(uploadTimer.value)
    }

    // 延迟执行，等待所有文件都加入队列（延迟时间稍长，确保所有文件都加入）
    uploadTimer.value = setTimeout(() => {
      processUploadQueue(currentBatchId.value)
    }, 200)

    return
  }

  // 单文件上传，直接上传
  await uploadSingleFile(file, onSuccess, onError)
}

// 处理上传队列（批量上传）
const processUploadQueue = async batchId => {
  if (isUploading.value || uploadQueue.value.length === 0) {
    return
  }

  // 只处理当前批次的文件
  const batchFiles = uploadQueue.value.filter(item => item.batchId === batchId)
  if (batchFiles.length === 0) {
    return
  }

  // 从队列中移除当前批次的文件
  uploadQueue.value = uploadQueue.value.filter(item => item.batchId !== batchId)

  // 如果批次ID匹配，清除批次ID
  if (currentBatchId.value === batchId) {
    currentBatchId.value = null
  }

  isUploading.value = true

  try {
    // 提取所有文件
    const files = batchFiles.map(item => item.file)

    // 一次性上传所有文件
    const response = await uploadFiles(files)

    if (!response) {
      // 所有文件都标记为失败
      batchFiles.forEach(({ onError }) => {
        onError(new Error('上传失败：服务器未返回响应'))
      })
      return
    }

    if (response && typeof response === 'object' && response.code === 200) {
      // 处理响应
      const uploadedFiles = response.data?.files || (response.data ? [response.data] : [])

      // 为每个文件调用 onSuccess
      batchFiles.forEach(({ file, onSuccess }, index) => {
        const fileResponse = uploadedFiles[index]
          ? { ...response, data: uploadedFiles[index] }
          : response
        onSuccess(fileResponse, file)
      })

      // 只触发一次 success 事件，传递完整的响应
      emit('success', response, files)
    } else {
      const errorMessage = response?.message || response?.error || '上传失败'
      batchFiles.forEach(({ onError }) => {
        onError(new Error(errorMessage))
      })
    }
  } catch (error) {
    batchFiles.forEach(({ onError }) => {
      onError(error)
    })
  } finally {
    isUploading.value = false
  }
}

// 单文件上传
const uploadSingleFile = async (file, onSuccess, onError) => {
  try {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`
    const response = await uploadFiles([file])

    if (!response) {
      onError(new Error('上传失败：服务器未返回响应'))
      return
    }

    if (response && typeof response === 'object' && response.code === 200) {
      onSuccess(response, file)

      // 直接触发 success 事件
      if (!successEmittedFiles.has(fileKey)) {
        successEmittedFiles.add(fileKey)
        emit('success', response, file)
      }
    } else {
      const errorMessage = response?.message || response?.error || '上传失败'
      onError(new Error(errorMessage))
    }
  } catch (error) {
    onError(error)
  }
}

// 上传成功回调（备用）
const handleSuccess = (response, uploadFile, fileList) => {
  if (!response || typeof response !== 'object' || response.code === undefined) {
    return
  }
}

// 上传失败
const handleError = (error, file) => {
  emit('error', error, file)
  ElMessage.error(error.message || '上传失败!')
}

// 移除文件
const handleRemove = (file, fileList) => {
  // 如果文件列表为空，重置批次ID
  if (fileList.length === 0) {
    currentBatchId.value = null
    uploadQueue.value = []
    if (uploadTimer.value) {
      clearTimeout(uploadTimer.value)
      uploadTimer.value = null
    }
  }
  emit('remove', file, fileList)
}

// 组件卸载时清理
onUnmounted(() => {
  if (uploadTimer.value) {
    clearTimeout(uploadTimer.value)
    uploadTimer.value = null
  }
  uploadQueue.value = []
  currentBatchId.value = null
})

// 暴露方法和属性
defineExpose({
  clearFiles: () => {
    uploadRef.value?.clearFiles()
  },
  submit: () => {
    uploadRef.value?.submit()
  },
  abort: () => {
    uploadRef.value?.abort()
  },
  uploadRef
})
</script>

<style scoped lang="scss">
.file-upload {
  width: 100%;

  &.upload-drag {
    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }

  .el-upload__tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.5;
  }

  // picture-card 模式样式
  :deep(.el-upload--picture-card) {
    .upload-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
      margin-top: 8px;
      line-height: 1.4;
    }
  }

  // avatar 模式样式
  :deep(.el-upload) {
    &.avatar-uploader {
      .avatar {
        width: 100px;
        height: 100px;
        display: block;
        object-fit: cover;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
      }
    }
  }
}
</style>
