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
import { ref, computed } from 'vue'
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
    default: 50
  },
  // 文件数量限制
  maxCount: {
    type: Number,
    default: 10
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

// 文件类型验证规则
const fileTypeRules = {
  image: {
    mimeTypes: ['image/'],
    extensions: /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i,
    accept: 'image/*',
    defaultTip: `支持 jpg/png/gif/webp/bmp/svg 格式的图片文件，文件大小不超过 ${props.maxSize}MB，最多${props.maxCount}个`
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
      /\.(jpg|jpeg|png|gif|webp|bmp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|tar|gz|txt|csv|json|xml|md|mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i,
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

  // 触发before-upload事件
  emit('before-upload', file)
  return true
}

// 处理上传
const handleUpload = async options => {
  const { file, onSuccess, onError } = options
  try {
    const response = await uploadFiles([file])

    // 检查响应是否存在且格式正确
    if (!response) {
      onError(new Error('上传失败：服务器未返回响应'))
      return
    }

    if (response && typeof response === 'object' && response.code === 200) {
      // 确保传递完整的响应对象给 Element Plus
      onSuccess(response, file)
    } else {
      const errorMessage = response?.message || response?.error || '上传失败'
      onError(new Error(errorMessage))
    }
  } catch (error) {
    onError(error)
  }
}

// 上传成功
// Element Plus 的 on-success 回调签名是 (response, uploadFile, fileList)
// 注意：使用 http-request 时，Element Plus 可能会多次调用此回调
// 我们需要确保只在 response 有效时才触发事件
const handleSuccess = (response, uploadFile, fileList) => {
  // 确保 response 存在且格式正确
  // Element Plus 可能会多次调用此回调，第二次可能 response 为 undefined
  if (!response || typeof response !== 'object' || response.code === undefined) {
    return
  }

  // 使用 uploadFile 作为 file（Element Plus 传递的是 uploadFile 对象）
  const file = uploadFile?.raw || uploadFile
  emit('success', response, file)
}

// 上传失败
const handleError = (error, file) => {
  emit('error', error, file)
  ElMessage.error(error.message || '上传失败!')
}

// 移除文件
const handleRemove = (file, fileList) => {
  emit('remove', file, fileList)
}

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
