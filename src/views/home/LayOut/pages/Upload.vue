<template>
  <div class="upload-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件上传</span>
          <el-button type="primary" @click="loadFileList" :loading="loading" :icon="Refresh">
            刷新列表
          </el-button>
        </div>
      </template>

      <!-- 图片上传区域 -->
      <el-card shadow="never" class="upload-section">
        <template #header>
          <span>图片上传</span>
        </template>
        <el-upload
          ref="imageUploadRef"
          class="upload-demo"
          drag
          :http-request="handleImageUpload"
          :on-success="handleImageSuccess"
          :on-error="handleError"
          :before-upload="beforeImageUpload"
          :limit="10"
          multiple
          accept="image/*"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持 jpg/png/gif/webp 格式的图片文件，文件大小不超过 10MB，最多10张
            </div>
          </template>
        </el-upload>
      </el-card>

      <!-- 通用文件上传区域 -->
      <el-card shadow="never" class="upload-section">
        <template #header>
          <span>通用文件上传</span>
        </template>
        <el-upload
          ref="fileUploadRef"
          class="upload-demo"
          drag
          :http-request="handleFileUpload"
          :on-success="handleFileSuccess"
          :on-error="handleError"
          :before-upload="beforeFileUpload"
          :limit="10"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              支持多种文件类型：图片(jpg,png,gif,webp)、文档(pdf,doc,docx,xls,xlsx,ppt,pptx)、压缩包(zip,rar,7z)、文本(txt,csv)
              <br />
              文件大小不超过 10MB，最多10个文件
            </div>
          </template>
        </el-upload>
      </el-card>

      <!-- 上传文件列表 -->
      <el-divider>已上传文件</el-divider>
      <el-table :data="fileList" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType || getFileTypeFromName(row.name))">
              {{ getFileTypeName(row.fileType || getFileTypeFromName(row.name)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="预览/下载" width="150" align="center">
          <template #default="{ row }">
            <el-image
              v-if="isImage(row.name)"
              :src="getImageUrl(row.url)"
              style="width: 60px; height: 60px; cursor: pointer"
              fit="cover"
              :preview-src-list="[getImageUrl(row.url)]"
            />
            <div
              v-else-if="isVideo(row.name)"
              class="video-preview-small"
              @click="handleVideoPreview(row)"
            >
              <video
                :src="getImageUrl(row.url)"
                style="width: 60px; height: 60px; object-fit: cover"
                muted
                @mouseenter="handleVideoHover($event, true)"
                @mouseleave="handleVideoHover($event, false)"
              />
              <div class="video-play-icon-small">
                <el-icon :size="20"><VideoPlay /></el-icon>
              </div>
            </div>
            <el-button v-else type="primary" link :icon="Download" @click="handleDownload(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ row.uploadTime ? new Date(row.uploadTime).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 视频预览对话框 -->
    <el-dialog
      v-model="videoPreviewVisible"
      :title="videoPreviewTitle"
      width="800px"
      @close="videoPreviewUrl = ''"
    >
      <div class="video-preview-container">
        <video :src="videoPreviewUrl" controls autoplay style="width: 100%; max-height: 70vh">
          您的浏览器不支持视频播放
        </video>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { UploadFilled, Refresh, Download, VideoPlay } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { uploadImages, uploadFiles, getImageList, deleteImage } from '@/api/upload'

defineOptions({
  name: 'Upload'
})

const imageUploadRef = ref(null)
const fileUploadRef = ref(null)
const userStore = useUserStore()
const loading = ref(false)

// 文件列表
const fileList = ref([])

// 视频预览相关
const videoPreviewVisible = ref(false)
const videoPreviewUrl = ref('')
const videoPreviewTitle = ref('')

// 加载文件列表
const loadFileList = async () => {
  loading.value = true
  try {
    const response = await getImageList()
    if (response.code === 200 && response.data) {
      // 优先使用 files（所有文件），如果没有则使用 list，最后使用 images（兼容旧接口）
      const files = response.data.files || response.data.list || response.data.images || []
      fileList.value = files.map(file => ({
        name: file.filename || file.originalName,
        size: file.size || 0,
        url: file.url || file.path, // 优先使用后端返回的完整 URL
        uploadTime: file.uploadTime || file.createdAt || file.lastModified,
        fileType: file.fileType || getFileTypeFromName(file.filename || file.originalName),
        mimetype: file.mimetype
      }))
    } else {
      ElMessage.error(response.message || '获取文件列表失败')
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
    ElMessage.error(error.message || '获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadFileList()
})

// 图片上传前验证
const beforeImageUpload = file => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

// 通用文件上传前验证
const beforeFileUpload = file => {
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }

  // 检查文件类型
  const allowedTypes =
    /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|txt|csv)$/i
  if (!allowedTypes.test(file.name)) {
    ElMessage.error('不支持的文件类型！允许的类型：图片、文档、压缩包、文本文件')
    return false
  }

  return true
}

// 图片上传方法
const handleImageUpload = async options => {
  const { file, onSuccess, onError } = options
  try {
    const response = await uploadImages([file])
    if (response.code === 200) {
      onSuccess(response, file)
    } else {
      onError(new Error(response.message || '上传失败'))
    }
  } catch (error) {
    onError(error)
  }
}

// 通用文件上传方法
const handleFileUpload = async options => {
  const { file, onSuccess, onError } = options
  try {
    const response = await uploadFiles([file])
    if (response.code === 200) {
      onSuccess(response, file)
    } else {
      onError(new Error(response.message || '上传失败'))
    }
  } catch (error) {
    onError(error)
  }
}

// 图片上传成功
const handleImageSuccess = async (response, file) => {
  try {
    if (response.code === 200) {
      ElMessage.success('图片上传成功!')
      // 重新加载文件列表
      await loadFileList()
    } else {
      ElMessage.error(response.message || '上传失败')
    }
  } catch (error) {
    console.error('处理上传成功回调失败:', error)
  }
}

// 通用文件上传成功
const handleFileSuccess = async (response, file) => {
  try {
    if (response.code === 200) {
      ElMessage.success('文件上传成功!')
      // 重新加载文件列表
      await loadFileList()
    } else {
      ElMessage.error(response.message || '上传失败')
    }
  } catch (error) {
    console.error('处理上传成功回调失败:', error)
  }
}

const handleError = (error, file) => {
  console.error('上传失败:', error, file)
  ElMessage.error('上传失败!')
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await deleteImage(row.name)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      await loadFileList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

const formatFileSize = size => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 获取图片完整 URL
// 后端已经返回完整的 url 字段，直接使用即可
const getImageUrl = url => {
  if (!url) return ''
  // 如果已经是完整 URL，直接返回
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  // 如果是对象（兼容旧代码），尝试获取 url 或 path
  if (typeof url === 'object') {
    return url.url || url.path || ''
  }
  return url
}

// 判断是否为图片
const isImage = filename => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

// 判断是否为视频
const isVideo = filename => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

// 根据文件名获取文件类型
const getFileTypeFromName = filename => {
  if (!filename) return 'other'
  const ext = filename.toLowerCase().split('.').pop()

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image'
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive'
  if (['txt', 'csv'].includes(ext)) return 'text'
  return 'other'
}

// 获取文件类型标签样式
const getFileTypeTag = fileType => {
  const typeMap = {
    image: 'success',
    document: 'primary',
    archive: 'warning',
    text: 'info',
    other: ''
  }
  return typeMap[fileType] || ''
}

// 获取文件类型名称
const getFileTypeName = fileType => {
  const typeMap = {
    image: '图片',
    document: '文档',
    archive: '压缩包',
    text: '文本',
    other: '其他'
  }
  return typeMap[fileType] || '未知'
}

// 下载文件
const handleDownload = row => {
  const url = getImageUrl(row.url)
  const link = document.createElement('a')
  link.href = url
  link.download = row.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('开始下载文件')
}

// 视频预览
const handleVideoPreview = row => {
  videoPreviewUrl.value = getImageUrl(row.url)
  videoPreviewTitle.value = row.name || '视频预览'
  videoPreviewVisible.value = true
}

// 视频悬停效果
const handleVideoHover = (event, isEnter) => {
  const video = event.target
  if (isEnter) {
    video.play().catch(() => {
      // 如果自动播放失败，忽略错误
    })
  } else {
    video.pause()
    video.currentTime = 0
  }
}
</script>

<style lang="scss" scoped>
.upload-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .upload-section {
    margin-bottom: 20px;

    :deep(.el-card__header) {
      font-weight: 600;
      font-size: 14px;
    }
  }

  .upload-demo {
    margin-bottom: 0;
  }

  .el-divider {
    margin: 20px 0;
  }

  .video-preview-small {
    position: relative;
    width: 60px;
    height: 60px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    background: #000;
    display: inline-block;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-play-icon-small {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.9);
      pointer-events: none;
      transition: opacity 0.3s;
    }

    &:hover .video-play-icon-small {
      opacity: 0.8;
    }
  }

  .video-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #000;
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>
