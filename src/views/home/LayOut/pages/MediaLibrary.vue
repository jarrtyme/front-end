<template>
  <div class="media-library-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>媒体库管理</span>
          <el-button type="primary" @click="loadMediaList" :loading="loading" :icon="Refresh">
            刷新列表
          </el-button>
        </div>
      </template>

      <!-- 上传区域 -->
      <el-card shadow="never" class="upload-section">
        <template #header>
          <span>上传媒体文件</span>
        </template>
        <el-tabs v-model="activeUploadTab">
          <el-tab-pane label="图片上传" name="image">
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
          </el-tab-pane>
          <el-tab-pane label="视频上传" name="video">
            <el-upload
              ref="videoUploadRef"
              class="upload-demo"
              drag
              :http-request="handleVideoUpload"
              :on-success="handleVideoSuccess"
              :on-error="handleError"
              :before-upload="beforeVideoUpload"
              :limit="5"
              multiple
              accept="video/*"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将视频拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 mp4/webm/ogg 格式的视频文件，文件大小不超过 50MB，最多5个
                </div>
              </template>
            </el-upload>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 筛选和搜索 -->
      <el-divider>媒体列表</el-divider>
      <div class="filter-section">
        <div class="filter-row">
          <el-radio-group v-model="filterType" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="image">图片</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="searchDescription"
            placeholder="搜索描述内容"
            style="width: 300px; margin-left: 20px"
            clearable
            @input="handleDescriptionSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 媒体列表 -->
      <el-table :data="mediaList" style="width: 100%" v-loading="loading">
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'image' ? 'success' : 'primary'">
              {{ row.type === 'image' ? '图片' : '视频' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="预览" width="150" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.type === 'image'"
              :src="getImageUrl(row.url)"
              style="width: 120px; height: 80px; cursor: pointer"
              fit="cover"
              :preview-src-list="[getImageUrl(row.url)]"
            />
            <div v-else class="video-preview" @click="handleVideoPreview(row)">
              <video
                :src="getImageUrl(row.url)"
                style="width: 120px; height: 80px; object-fit: cover"
                muted
                @mouseenter="handleVideoHover($event, true)"
                @mouseleave="handleVideoHover($event, false)"
              />
              <div class="video-play-icon">
                <el-icon :size="30"><VideoPlay /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="200">
          <template #default="{ row }">
            <div class="descriptions-container">
              <el-tag
                v-for="(desc, index) in row.descriptions"
                :key="desc._id || index"
                closable
                @close="handleRemoveDescription(row, desc._id)"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ desc.text }}
              </el-tag>
              <el-button
                type="primary"
                link
                :icon="Plus"
                @click="handleAddDescription(row)"
                style="margin-left: 4px"
              >
                添加描述
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 添加描述对话框 -->
    <el-dialog v-model="descriptionDialogVisible" title="添加描述" width="500px">
      <el-input
        v-model="newDescription"
        type="textarea"
        :rows="4"
        placeholder="请输入描述内容"
        maxlength="500"
        show-word-limit
      />
      <template #footer>
        <el-button @click="descriptionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddDescription" :loading="descriptionLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, UploadFilled, Delete, Plus, Search, VideoPlay } from '@element-plus/icons-vue'
import { uploadImages, uploadFiles } from '@/api/upload'
import {
  createMedia,
  getMediaList,
  deleteMedia,
  addDescription,
  removeDescription
} from '@/api/media'

// 数据
const loading = ref(false)
const mediaList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filterType = ref('')
const searchDescription = ref('')
const activeUploadTab = ref('image')

// 上传相关
const imageUploadRef = ref(null)
const videoUploadRef = ref(null)

// 描述相关
const descriptionDialogVisible = ref(false)
const descriptionLoading = ref(false)
const newDescription = ref('')
const currentMedia = ref(null)

// 视频预览相关
const videoPreviewVisible = ref(false)
const videoPreviewUrl = ref('')
const videoPreviewTitle = ref('')

// 加载媒体列表
const loadMediaList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    if (filterType.value) {
      params.type = filterType.value
    }
    if (searchDescription.value && searchDescription.value.trim()) {
      params.description = searchDescription.value.trim()
    }
    const response = await getMediaList(params)
    if (response.code === 200) {
      mediaList.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取媒体列表失败')
    }
  } catch (error) {
    console.error('加载媒体列表失败:', error)
    ElMessage.error('加载媒体列表失败')
  } finally {
    loading.value = false
  }
}

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

// 视频上传前验证
const beforeVideoUpload = file => {
  const isVideo = file.type.startsWith('video/')
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('视频大小不能超过 50MB!')
    return false
  }
  return true
}

// 图片上传
const handleImageUpload = async options => {
  try {
    const response = await uploadImages([options.file])
    if (response.code === 200 && response.data.files && response.data.files.length > 0) {
      const file = response.data.files[0]
      // 创建媒体记录
      await createMedia({
        type: 'image',
        url: file.url || file.path,
        filename: file.filename || file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        descriptions: []
      })
      return { success: true }
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}

// 视频上传
const handleVideoUpload = async options => {
  try {
    const response = await uploadFiles([options.file])
    if (response.code === 200 && response.data.files && response.data.files.length > 0) {
      const file = response.data.files[0]
      // 创建媒体记录
      await createMedia({
        type: 'video',
        url: file.url || file.path,
        filename: file.filename || file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        descriptions: []
      })
      return { success: true }
    } else {
      throw new Error(response.message || '上传失败')
    }
  } catch (error) {
    console.error('视频上传失败:', error)
    throw error
  }
}

// 上传成功回调
const handleImageSuccess = () => {
  ElMessage.success('图片上传成功!')
  loadMediaList()
}

const handleVideoSuccess = () => {
  ElMessage.success('视频上传成功!')
  loadMediaList()
}

// 上传失败回调
const handleError = error => {
  console.error('上传失败:', error)
  ElMessage.error('上传失败!')
}

// 筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  loadMediaList()
}

// 描述搜索处理（防抖）
let descriptionSearchTimer = null
const handleDescriptionSearch = () => {
  if (descriptionSearchTimer) {
    clearTimeout(descriptionSearchTimer)
  }
  descriptionSearchTimer = setTimeout(() => {
    currentPage.value = 1
    loadMediaList()
  }, 500)
}

// 分页变化
const handleSizeChange = () => {
  currentPage.value = 1
  loadMediaList()
}

const handlePageChange = () => {
  loadMediaList()
}

// 添加描述
const handleAddDescription = media => {
  currentMedia.value = media
  newDescription.value = ''
  descriptionDialogVisible.value = true
}

// 确认添加描述
const confirmAddDescription = async () => {
  if (!newDescription.value.trim()) {
    ElMessage.warning('请输入描述内容')
    return
  }

  descriptionLoading.value = true
  try {
    const response = await addDescription(currentMedia.value._id, newDescription.value.trim())
    if (response.code === 200) {
      ElMessage.success('描述添加成功!')
      descriptionDialogVisible.value = false
      loadMediaList()
    } else {
      ElMessage.error(response.message || '添加描述失败')
    }
  } catch (error) {
    console.error('添加描述失败:', error)
    ElMessage.error('添加描述失败')
  } finally {
    descriptionLoading.value = false
  }
}

// 删除描述
const handleRemoveDescription = async (media, descriptionId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条描述吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await removeDescription(media._id, descriptionId)
    if (response.code === 200) {
      ElMessage.success('描述删除成功!')
      loadMediaList()
    } else {
      ElMessage.error(response.message || '删除描述失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除描述失败:', error)
      ElMessage.error('删除描述失败')
    }
  }
}

// 删除媒体
const handleDelete = async media => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这个${media.type === 'image' ? '图片' : '视频'}吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deleteMedia(media._id)
    if (response.code === 200) {
      ElMessage.success('删除成功!')
      loadMediaList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 获取图片URL
const getImageUrl = url => {
  if (!url) return ''
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  if (typeof url === 'object') {
    return url.url || url.path || ''
  }
  return url
}

// 格式化文件大小
const formatFileSize = size => {
  if (!size) return '0 B'
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 视频预览
const handleVideoPreview = media => {
  videoPreviewUrl.value = getImageUrl(media.url)
  videoPreviewTitle.value = media.filename || '视频预览'
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

// 初始化
onMounted(() => {
  loadMediaList()
})
</script>

<style scoped lang="scss">
.media-library-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .upload-section {
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 20px;

    .filter-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  }

  .descriptions-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .video-preview {
    position: relative;
    width: 120px;
    height: 80px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    background: #000;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(255, 255, 255, 0.9);
      pointer-events: none;
      transition: opacity 0.3s;
    }

    &:hover .video-play-icon {
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

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
