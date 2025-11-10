<template>
  <div class="file-manager-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文件管理</span>
          <el-button type="primary" @click="loadFileList" :loading="loading" :icon="Refresh">
            刷新列表
          </el-button>
        </div>
      </template>

      <!-- 文件列表筛选和上传 -->
      <div class="filter-section">
        <div class="filter-group">
          <el-radio-group v-model="filterType" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="image">图片</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
            <el-radio-button label="document">文档</el-radio-button>
            <el-radio-button label="archive">压缩包</el-radio-button>
            <el-radio-button label="text">文本</el-radio-button>
            <el-radio-button label="other">其他</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="descriptionSearch"
            placeholder="搜索描述..."
            clearable
            style="width: 200px; margin-left: 16px"
            @clear="handleDescriptionClear"
            @keydown.enter.prevent="handleDescriptionSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="action-buttons">
          <el-button
            v-if="selectedFiles.length > 0"
            type="danger"
            :icon="Delete"
            @click="handleBatchDelete"
            :loading="batchDeleting"
          >
            批量删除 ({{ selectedFiles.length }})
          </el-button>
          <FileUpload
            ref="fileUploadRef"
            file-type="all"
            :max-size="50"
            :max-count="10"
            :multiple="true"
            :drag="false"
            button-text="上传文件"
            @success="handleFileSuccess"
          />
        </div>
      </div>

      <!-- 文件列表 -->
      <el-divider>文件列表</el-divider>
      <el-table
        :data="filteredFileList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
        <!-- <el-table-column prop="name" label="文件名" /> -->
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

        <el-table-column label="描述" min-width="200">
          <template #default="{ row }">
            <div v-if="isImageOrVideo(row)" class="descriptions-container">
              <el-tag
                v-for="(desc, index) in getMediaDescriptions(row)"
                :key="desc._id || index"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ desc.text }}
              </el-tag>
              <el-button
                type="primary"
                link
                :icon="Plus"
                @click="handleOpenDescriptionDialog(row)"
                style="margin-left: 4px"
              >
                {{ getMediaDescriptions(row).length > 0 ? '管理描述' : '添加描述' }}
              </el-button>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180">
          <template #default="{ row }">
            {{ row.uploadTime ? new Date(row.uploadTime).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isImageOrVideo(row) && !row.isAddedToLibrary"
              type="success"
              link
              size="small"
              @click="handleAddToMediaLibrary(row)"
            >
              添加到媒体库
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 管理描述对话框 -->
    <ModernDialog
      v-model="descriptionDialogVisible"
      title="管理描述"
      width="600px"
      confirm-text="保存"
      :confirm-loading="descriptionLoading"
      @confirm="confirmSaveDescriptions"
      @close="handleDescriptionDialogClose"
    >
      <div class="descriptions-manage-container">
        <div
          v-for="(desc, index) in editingDescriptions"
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
            @click="handleRemoveDescriptionItem(index)"
            class="description-delete-btn"
          />
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleAddDescriptionItem"
          class="add-description-btn"
        >
          添加描述
        </el-button>
      </div>
    </ModernDialog>

    <!-- 视频预览对话框 -->
    <ModernDialog
      v-model="videoPreviewVisible"
      :title="videoPreviewTitle"
      width="800px"
      @close="handleVideoPreviewClose"
    >
      <template #footer>
        <div></div>
      </template>
      <div class="video-preview-container">
        <video :src="videoPreviewUrl" controls autoplay style="width: 100%; max-height: 70vh">
          您的浏览器不支持视频播放
        </video>
      </div>
    </ModernDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Download, VideoPlay, Plus, Delete, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFileList, deleteFile, deleteFiles } from '@/api/upload'
import {
  createMedia,
  deleteMedia,
  deleteMedias,
  addDescription,
  removeDescription,
  updateDescription
} from '@/api/media'
import ModernDialog from '@/components/ModernDialog.vue'
import FileUpload from '@/components/FileUpload.vue'

defineOptions({
  name: 'FileManager'
})

const fileUploadRef = ref(null)
const userStore = useUserStore()
const loading = ref(false)

// 文件列表
const fileList = ref([])
// 筛选类型
const filterType = ref('')
// 描述搜索关键字
const descriptionSearch = ref('')
// 描述搜索防抖标志
const isSearching = ref(false)
// 选中的文件
const selectedFiles = ref([])
// 批量删除中
const batchDeleting = ref(false)
// 分页相关
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

// 描述相关
const descriptionDialogVisible = ref(false)
const descriptionLoading = ref(false)
const currentFile = ref(null)
const editingDescriptions = ref([])

// 视频预览相关
const videoPreviewVisible = ref(false)
const videoPreviewUrl = ref('')
const videoPreviewTitle = ref('')

// 加载文件列表
const loadFileList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const queryParams = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    // 如果有筛选类型，添加到查询参数
    if (filterType.value) {
      queryParams.fileType = filterType.value
    }
    // 如果有描述搜索关键字，添加到查询参数
    if (descriptionSearch.value && descriptionSearch.value.trim()) {
      queryParams.description = descriptionSearch.value.trim()
    }

    // 只调用一个接口，后端会同时返回文件列表和媒体库信息
    const fileResponse = await getFileList(queryParams)

    // 处理文件列表
    if (fileResponse.code === 200 && fileResponse.data) {
      const files = fileResponse.data.files || fileResponse.data.list || []

      // 后端已经在每个文件对象中包含了 isAddedToLibrary、mediaId、descriptions 等字段
      // 直接使用即可，不需要再做路径匹配
      fileList.value = files.map(file => ({
        name: file.filename || file.originalName,
        size: file.size || 0,
        url: file.url || file.path,
        path: file.path,
        uploadTime: file.uploadTime || file.createdAt || file.lastModified,
        fileType: file.fileType || getFileTypeFromName(file.filename || file.originalName),
        mimetype: file.mimetype,
        mediaId: file.mediaId || null,
        isAddedToLibrary: file.isAddedToLibrary !== undefined ? file.isAddedToLibrary : false,
        descriptions: file.descriptions || []
      }))

      // 更新分页信息
      if (fileResponse.data.total !== undefined) {
        pagination.value.total = fileResponse.data.total
        pagination.value.pages =
          fileResponse.data.pages || Math.ceil(fileResponse.data.total / pagination.value.limit)
      }
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
    ElMessage.error(error.message || '获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选后的文件列表（现在由后端筛选，这里直接返回）
const filteredFileList = computed(() => {
  return fileList.value
})

// 筛选变化处理
const handleFilterChange = () => {
  // 筛选类型变化时，重置到第一页并重新加载
  pagination.value.page = 1
  selectedFiles.value = []
  loadFileList()
}

// 描述搜索处理
const handleDescriptionSearch = event => {
  // 如果正在搜索，直接返回，防止重复调用
  if (isSearching.value) {
    return
  }

  // 阻止默认行为和事件冒泡
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // 设置搜索标志
  isSearching.value = true

  // 描述搜索时，重置到第一页并重新加载
  pagination.value.page = 1
  selectedFiles.value = []

  // 异步加载文件列表
  loadFileList().finally(() => {
    // 搜索完成后重置标志
    isSearching.value = false
  })
}

// 描述清除处理
const handleDescriptionClear = () => {
  // 清除时，重置到第一页并重新加载
  pagination.value.page = 1
  selectedFiles.value = []
  loadFileList()
}

// 分页变化处理
const handlePageChange = page => {
  pagination.value.page = page
  selectedFiles.value = []
  loadFileList()
}

// 每页数量变化处理
const handleSizeChange = size => {
  pagination.value.limit = size
  pagination.value.page = 1
  selectedFiles.value = []
  loadFileList()
}

// 选择变化处理
const handleSelectionChange = selection => {
  selectedFiles.value = selection
}

// 初始化加载
onMounted(() => {
  loadFileList()
})

// 文件上传成功
const handleFileSuccess = async (response, file) => {
  try {
    // 检查 response 是否存在
    if (!response) {
      ElMessage.error('上传失败：服务器未返回响应')
      return
    }

    // 检查 response 格式
    if (response && typeof response === 'object') {
      // 检查是否有 code 属性
      if (response.code === 200) {
        ElMessage.success('文件上传成功!')
        // 重新加载文件列表
        await loadFileList()
      } else {
        // 处理错误响应
        const errorMessage = response?.message || response?.error || '上传失败'
        ElMessage.error(errorMessage)
      }
    } else {
      // response 格式不正确
      ElMessage.error('上传失败：响应格式不正确')
    }
  } catch (error) {
    ElMessage.error('处理上传结果时发生错误: ' + (error.message || '未知错误'))
  }
}

// 判断是否为图片或视频
const isImageOrVideo = row => {
  return row.fileType === 'image' || row.fileType === 'video'
}

// 获取媒体库描述
const getMediaDescriptions = row => {
  return row.descriptions || []
}

// 添加到媒体库
const handleAddToMediaLibrary = async row => {
  try {
    loading.value = true
    const fileType = row.fileType === 'image' ? 'image' : 'video'
    const response = await createMedia({
      type: fileType,
      url: row.url || row.path,
      filename: row.name,
      size: row.size,
      mimetype: row.mimetype,
      descriptions: []
    })
    if (response.code === 200) {
      // 检查返回的消息，判断是新建还是已存在
      if (response.message && response.message.includes('already exists')) {
        ElMessage.info('该文件已在媒体库中')
      } else {
        ElMessage.success('已添加到媒体库!')
      }
      await loadFileList()
    } else {
      ElMessage.error(response.message || '添加到媒体库失败')
    }
  } catch (error) {
    console.error('添加到媒体库失败:', error)
    // 如果是409冲突错误，说明已存在
    if (error.message && error.message.includes('already exists')) {
      ElMessage.info('该文件已在媒体库中')
      await loadFileList()
    } else {
      ElMessage.error(error.message || '添加到媒体库失败')
    }
  } finally {
    loading.value = false
  }
}

// 打开描述管理对话框
const handleOpenDescriptionDialog = row => {
  if (!row.isAddedToLibrary || !row.mediaId) {
    ElMessage.warning('请先将文件添加到媒体库')
    return
  }
  currentFile.value = row
  const descriptions = getMediaDescriptions(row)
  editingDescriptions.value = descriptions.map(desc => ({
    _id: desc._id,
    text: desc.text,
    createdAt: desc.createdAt
  }))
  descriptionDialogVisible.value = true
}

// 添加描述项
const handleAddDescriptionItem = () => {
  editingDescriptions.value.push({
    _id: null,
    text: '',
    createdAt: new Date()
  })
}

// 删除描述项
const handleRemoveDescriptionItem = index => {
  editingDescriptions.value.splice(index, 1)
}

// 关闭描述对话框
const handleDescriptionDialogClose = () => {
  descriptionDialogVisible.value = false
  editingDescriptions.value = []
  currentFile.value = null
}

// 确认保存描述
const confirmSaveDescriptions = async () => {
  const validDescriptions = editingDescriptions.value.filter(desc => desc.text.trim())
  if (validDescriptions.length === 0) {
    ElMessage.warning('至少需要保留一条描述')
    return
  }

  descriptionLoading.value = true
  try {
    const originalDescriptions = getMediaDescriptions(currentFile.value) || []
    const originalDescMap = new Map(originalDescriptions.map(desc => [desc._id?.toString(), desc]))

    const toAdd = []
    const toUpdate = []
    const toDelete = []

    validDescriptions.forEach(desc => {
      if (desc._id) {
        const original = originalDescMap.get(desc._id.toString())
        if (original && original.text !== desc.text.trim()) {
          toUpdate.push({ id: desc._id, text: desc.text.trim() })
        }
        originalDescMap.delete(desc._id.toString())
      } else {
        toAdd.push(desc.text.trim())
      }
    })

    originalDescMap.forEach(desc => {
      toDelete.push(desc._id)
    })

    const promises = []
    toAdd.forEach(text => {
      promises.push(addDescription(currentFile.value.mediaId, text))
    })
    toUpdate.forEach(({ id, text }) => {
      promises.push(updateDescription(currentFile.value.mediaId, id, text))
    })
    toDelete.forEach(descId => {
      promises.push(removeDescription(currentFile.value.mediaId, descId))
    })

    await Promise.all(promises)

    ElMessage.success('描述保存成功!')
    handleDescriptionDialogClose()
    await loadFileList()
  } catch (error) {
    console.error('保存描述失败:', error)
    ElMessage.error('保存描述失败')
  } finally {
    descriptionLoading.value = false
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }

  try {
    const hasMediaFiles = selectedFiles.value.filter(file => file.isAddedToLibrary && file.mediaId)
    const message =
      hasMediaFiles.length > 0
        ? `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？\n其中 ${hasMediaFiles.length} 个文件在媒体库中，删除后将同时删除文件和相关描述，此操作不可恢复！`
        : `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可恢复！`

    await ElMessageBox.confirm(message, '批量删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    batchDeleting.value = true

    // 分离媒体库文件和普通文件
    const mediaIds = []
    const fileList = []

    selectedFiles.value.forEach(file => {
      if (file.isAddedToLibrary && file.mediaId) {
        mediaIds.push(file.mediaId)
      } else {
        let filePath = file.path
        if (!filePath && file.url) {
          try {
            const url = new URL(file.url)
            filePath = url.pathname
            if (filePath.startsWith('/api')) {
              filePath = filePath.substring(4)
            }
          } catch {
            filePath = file.url.replace(/^https?:\/\/[^/]+/, '')
            if (filePath.startsWith('/api')) {
              filePath = filePath.substring(4)
            }
          }
        }
        fileList.push({
          filename: file.name,
          filePath: filePath
        })
      }
    })

    // 并行执行批量删除
    const promises = []
    if (mediaIds.length > 0) {
      promises.push(deleteMedias(mediaIds))
    }
    if (fileList.length > 0) {
      promises.push(deleteFiles(fileList))
    }

    const results = await Promise.allSettled(promises)
    let totalSuccess = 0
    let totalFail = 0

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.code === 200) {
        const data = result.value.data
        totalSuccess += data.successCount || 0
        totalFail += data.failCount || 0
      } else if (result.status === 'fulfilled' && result.value.code === 207) {
        // 部分成功
        const data = result.value.data
        totalSuccess += data.successCount || 0
        totalFail += data.failCount || 0
      } else {
        // 完全失败
        totalFail += index === 0 ? mediaIds.length : fileList.length
      }
    })

    if (totalSuccess > 0) {
      ElMessage.success(
        `成功删除 ${totalSuccess} 个文件${totalFail > 0 ? `，${totalFail} 个删除失败` : ''}`
      )
      selectedFiles.value = []
      await loadFileList()
    } else {
      ElMessage.error('批量删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  } finally {
    batchDeleting.value = false
  }
}

const handleDelete = async row => {
  try {
    const hasMedia = row.isAddedToLibrary && row.mediaId
    const message = hasMedia
      ? `确定要删除文件 "${row.name}" 吗？\n删除后将同时删除文件和相关描述，此操作不可恢复！`
      : `确定要删除文件 "${row.name}" 吗？`

    await ElMessageBox.confirm(message, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true

    // 如果文件在媒体库中，先删除媒体库记录（会自动删除文件）
    if (hasMedia) {
      const response = await deleteMedia(row.mediaId)
      if (response.code === 200) {
        ElMessage.success('删除成功!文件和相关描述已一并删除。')
        await loadFileList()
        return
      } else {
        ElMessage.error(response.message || '删除失败')
        return
      }
    }

    // 否则只删除文件
    let filePath = row.path
    if (!filePath && row.url) {
      try {
        const url = new URL(row.url)
        filePath = url.pathname
        if (filePath.startsWith('/api')) {
          filePath = filePath.substring(4)
        }
      } catch {
        filePath = row.url.replace(/^https?:\/\/[^/]+/, '')
        if (filePath.startsWith('/api')) {
          filePath = filePath.substring(4)
        }
      }
    }
    const response = await deleteFile(row.name, filePath)
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

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(ext)) return 'video'
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['txt', 'csv', 'json', 'xml', 'md'].includes(ext)) return 'text'
  return 'other'
}

// 获取文件类型标签样式
const getFileTypeTag = fileType => {
  const typeMap = {
    image: 'success',
    video: 'primary',
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
    video: '视频',
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

// 视频预览关闭
const handleVideoPreviewClose = () => {
  videoPreviewUrl.value = ''
  videoPreviewVisible.value = false
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
.file-manager-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;

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

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .el-divider {
    margin: 20px 0;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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

  .descriptions-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .descriptions-manage-container {
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
}
</style>
