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
        <FileFilter
          :filter-type="filterType"
          :description-search="descriptionSearch"
          @filter-change="handleFilterChange"
          @search="handleDescriptionSearch"
          @clear="handleDescriptionClear"
          @input-change="handleDescriptionInputChange"
        />
        <BatchActions
          :selected-files="selectedFiles"
          :batch-deleting="batchDeleting"
          :batch-adding-to-library="batchAddingToLibrary"
          :batch-adding-description="batchAddingDescription"
          @batch-delete="handleBatchDelete"
          @batch-add-to-library="handleBatchAddToLibrary"
          @open-batch-description-dialog="handleOpenBatchDescriptionDialog"
        >
          <FileUpload
            ref="fileUploadRef"
            file-type="all"
            :max-size="100"
            :max-count="200"
            :multiple="true"
            :drag="false"
            button-text="上传文件"
            @success="handleFileSuccess"
          />
        </BatchActions>
      </div>

      <!-- 文件列表 -->
      <el-divider>文件列表</el-divider>
      <FileListTable
        :file-list="filteredFileList"
        :loading="loading"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @video-preview="handleVideoPreview"
        @download="handleDownload"
        @add-to-media-library="handleAddToMediaLibrary"
        @delete="handleDelete"
        @open-description-dialog="handleOpenDescriptionDialog"
      />
    </el-card>

    <!-- 管理描述对话框 -->
    <DescriptionDialog
      v-model="descriptionDialogVisible"
      title="管理描述"
      :confirm-loading="descriptionLoading"
      :descriptions="editingDescriptions"
      :is-batch="false"
      @confirm="confirmSaveDescriptions"
      @close="handleDescriptionDialogClose"
    />

    <!-- 视频预览对话框 -->
    <VideoPreviewDialog
      v-model="videoPreviewVisible"
      :title="videoPreviewTitle"
      :video-url="videoPreviewUrl"
      @close="handleVideoPreviewClose"
    />

    <!-- 批量添加描述对话框 -->
    <DescriptionDialog
      v-model="batchDescriptionDialogVisible"
      title="批量添加描述"
      :confirm-loading="batchDescriptionLoading"
      :descriptions="batchDescriptions"
      :is-batch="true"
      :file-count="selectedFilesInLibrary.length"
      @confirm="confirmBatchAddDescription"
      @close="handleBatchDescriptionDialogClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getFileList, deleteFile, deleteFiles } from '@/api/upload'
import {
  createMedia,
  deleteMedia,
  deleteMedias,
  addDescription,
  removeDescription,
  updateDescription,
  batchAddDescription,
  batchCreateMedia
} from '@/api/media'
import FileUpload from '@/components/FileUpload.vue'
import FileFilter from './components/FileFilter.vue'
import BatchActions from './components/BatchActions.vue'
import FileListTable from './components/FileListTable.vue'
import { getFileTypeFromName, FILE_TYPES } from '@/config/fileType'
import DescriptionDialog from './components/DescriptionDialog.vue'
import VideoPreviewDialog from './components/VideoPreviewDialog.vue'
import logger from '@/utils/logger'

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
// 批量添加到媒体库中
const batchAddingToLibrary = ref(false)
// 批量添加描述中
const batchAddingDescription = ref(false)
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

// 批量添加描述相关
const batchDescriptionDialogVisible = ref(false)
const batchDescriptionLoading = ref(false)
const batchDescriptions = ref([{ text: '' }])

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
    logger.error('加载文件列表失败:', error)
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
const handleFilterChange = value => {
  // 更新筛选类型
  filterType.value = value
  // 筛选类型变化时，重置到第一页并重新加载
  pagination.value.page = 1
  selectedFiles.value = []
  loadFileList()
}

// 描述搜索输入变化处理
const handleDescriptionInputChange = value => {
  descriptionSearch.value = value
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
  descriptionSearch.value = ''
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

// 判断是否为图片或视频
const isImageOrVideo = file => {
  return file.fileType === FILE_TYPES.IMAGE || file.fileType === FILE_TYPES.VIDEO
}

// 计算选中的未添加到媒体库的文件（图片或视频）
const selectedFilesNotInLibrary = computed(() => {
  return selectedFiles.value.filter(file => isImageOrVideo(file) && !file.isAddedToLibrary)
})

// 计算选中的已添加到媒体库的文件（图片或视频）
const selectedFilesInLibrary = computed(() => {
  return selectedFiles.value.filter(
    file => isImageOrVideo(file) && file.isAddedToLibrary && file.mediaId
  )
})

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
        // 多文件上传时，file 可能是数组，response.message 会包含文件数量
        const fileCount = Array.isArray(file) ? file.length : 1
        const message =
          response.message || (fileCount > 1 ? `成功上传 ${fileCount} 个文件!` : '文件上传成功!')
        ElMessage.success(message)

        // 上传成功后自动刷新文件列表
        await loadFileList()

        // 清空上传组件的文件列表，避免达到限制后无法继续上传
        if (fileUploadRef.value && fileUploadRef.value.clearFiles) {
          fileUploadRef.value.clearFiles()
        }
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
    logger.error('处理上传结果时发生错误:', error)
    ElMessage.error('处理上传结果时发生错误: ' + (error.message || '未知错误'))
  }
}

// 获取媒体库描述
const getMediaDescriptions = row => {
  return row.descriptions || []
}

// 添加到媒体库
const handleAddToMediaLibrary = async row => {
  try {
    loading.value = true
    const fileType = row.fileType === FILE_TYPES.IMAGE ? FILE_TYPES.IMAGE : FILE_TYPES.VIDEO
    // 优先使用 path（相对路径），确保与文件系统中的路径格式一致
    // path 格式如：/uploads/images/xxx.jpg，与后端存储格式一致
    const fileUrl = row.path || row.url
    logger.debug(
      '[前端] 添加到媒体库 - 文件路径:',
      fileUrl,
      '原始 url:',
      row.url,
      '原始 path:',
      row.path
    )
    const response = await createMedia({
      type: fileType,
      url: fileUrl,
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
    logger.error('添加到媒体库失败:', error)
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
  // 添加空值检查
  if (!row) {
    ElMessage.warning('文件信息不存在')
    return
  }
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

// 关闭描述对话框
const handleDescriptionDialogClose = () => {
  descriptionDialogVisible.value = false
  editingDescriptions.value = []
  currentFile.value = null
}

// 确认保存描述
const confirmSaveDescriptions = async descriptions => {
  // 添加空值检查
  if (!currentFile.value || !currentFile.value.mediaId) {
    ElMessage.error('文件信息不存在，无法保存描述')
    return
  }

  // 从事件参数获取描述数据，过滤空描述
  const validDescriptions = descriptions.filter(desc => desc.text && desc.text.trim())

  descriptionLoading.value = true
  try {
    const originalDescriptions = getMediaDescriptions(currentFile.value) || []
    // 统一处理 ID 类型转换：确保 _id 转换为字符串进行比较
    const originalDescMap = new Map(
      originalDescriptions.map(desc => {
        const id = desc._id ? (typeof desc._id === 'string' ? desc._id : desc._id.toString()) : null
        return [id, desc]
      })
    )

    const toAdd = []
    const toUpdate = []
    const toDelete = []

    validDescriptions.forEach(desc => {
      if (desc._id) {
        // 统一处理 ID 类型转换
        const descId = typeof desc._id === 'string' ? desc._id : desc._id.toString()
        const original = originalDescMap.get(descId)
        if (original && original.text !== desc.text.trim()) {
          toUpdate.push({ id: desc._id, text: desc.text.trim() })
        }
        originalDescMap.delete(descId)
      } else {
        toAdd.push(desc.text.trim())
      }
    })

    // 剩余的原始描述需要删除
    originalDescMap.forEach(desc => {
      toDelete.push(desc._id)
    })

    // 如果没有需要执行的操作，直接返回
    if (toAdd.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
      ElMessage.info('描述未发生变化')
      handleDescriptionDialogClose()
      return
    }

    // 使用 Promise.allSettled 处理部分失败的情况
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

    const results = await Promise.allSettled(promises)

    // 检查结果，统计成功和失败的数量
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length

    if (failCount === 0) {
      ElMessage.success('描述保存成功!')
    } else if (successCount > 0) {
      ElMessage.warning(`部分操作成功（${successCount} 个成功，${failCount} 个失败）`)
      // 记录失败的详细信息
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`描述操作失败 [${index}]:`, result.reason)
        }
      })
    } else {
      // 所有操作都失败
      const errorMessages = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message || '未知错误')
      logger.error('保存描述失败:', errorMessages)
      ElMessage.error(`保存描述失败: ${errorMessages[0] || '未知错误'}`)
      return // 如果全部失败，不关闭对话框，让用户重试
    }

    handleDescriptionDialogClose()
    await loadFileList()
  } catch (error) {
    logger.error('保存描述失败:', error)
    ElMessage.error(error.message || '保存描述失败')
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
    const messages = []
    let hasSuccess = false
    let hasError = false

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const response = result.value
        // 使用后端返回的消息
        if (response.message) {
          messages.push(response.message)
        }
        // 判断是否有成功删除
        if (response.code === 200 || response.code === 207) {
          const data = response.data
          if (data && data.successCount > 0) {
            hasSuccess = true
          }
          if (data && data.failCount > 0) {
            hasError = true
          }
        } else {
          hasError = true
        }
      } else {
        // Promise 被拒绝
        hasError = true
        const errorMsg =
          index === 0
            ? `媒体库删除失败: ${result.reason?.message || '未知错误'}`
            : `文件删除失败: ${result.reason?.message || '未知错误'}`
        messages.push(errorMsg)
      }
    })

    // 合并所有消息
    if (messages.length > 0) {
      // 如果只有一个消息，直接使用；如果有多个，用分号连接
      const combinedMessage = messages.length === 1 ? messages[0] : messages.join('；')
      if (hasSuccess) {
        ElMessage.success(combinedMessage)
      } else {
        ElMessage.error(combinedMessage)
      }
      selectedFiles.value = []
      // 刷新列表
      await loadFileList()
    } else {
      ElMessage.error('批量删除失败')
      // 即使全部失败，也刷新列表以确保数据同步
      await loadFileList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      logger.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
      // 出错时也刷新列表
      await loadFileList()
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
      logger.error('删除文件失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 下载文件
const handleDownload = row => {
  // 获取图片完整 URL
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
  // 获取图片完整 URL
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
  videoPreviewUrl.value = getImageUrl(row.url)
  videoPreviewTitle.value = row.name || '视频预览'
  videoPreviewVisible.value = true
}

// 视频预览关闭
const handleVideoPreviewClose = () => {
  videoPreviewUrl.value = ''
  videoPreviewVisible.value = false
}

// 批量添加到媒体库
const handleBatchAddToLibrary = async () => {
  const filesToAdd = selectedFilesNotInLibrary.value
  if (filesToAdd.length === 0) {
    ElMessage.warning('请选择要添加到媒体库的文件')
    return
  }

  try {
    batchAddingToLibrary.value = true

    // 构建批量创建的数据
    const items = filesToAdd.map(file => {
      const fileType = file.fileType === FILE_TYPES.IMAGE ? FILE_TYPES.IMAGE : FILE_TYPES.VIDEO
      const fileUrl = file.path || file.url
      return {
        type: fileType,
        url: fileUrl,
        filename: file.name,
        size: file.size || 0,
        mimetype: file.mimetype || '',
        descriptions: []
      }
    })

    const response = await batchCreateMedia(items)

    if (response.code === 200 || response.code === 207) {
      const data = response.data
      const successCount = data.successCount || 0
      const failCount = data.failCount || 0

      if (successCount > 0) {
        ElMessage.success(
          `成功添加 ${successCount} 个文件到媒体库${failCount > 0 ? `，${failCount} 个失败` : ''}`
        )
        selectedFiles.value = []
        await loadFileList()
      } else {
        ElMessage.error('批量添加到媒体库失败')
      }
    } else {
      ElMessage.error(response.message || '批量添加到媒体库失败')
    }
  } catch (error) {
    logger.error('批量添加到媒体库失败:', error)
    ElMessage.error(error.message || '批量添加到媒体库失败')
  } finally {
    batchAddingToLibrary.value = false
  }
}

// 打开批量添加描述对话框
const handleOpenBatchDescriptionDialog = () => {
  const filesToAddDesc = selectedFilesInLibrary.value
  if (filesToAddDesc.length === 0) {
    ElMessage.warning('请选择已添加到媒体库的文件')
    return
  }

  // 初始化描述列表（至少一个空描述）
  batchDescriptions.value = [{ text: '' }]
  batchDescriptionDialogVisible.value = true
}

// 关闭批量添加描述对话框
const handleBatchDescriptionDialogClose = () => {
  batchDescriptionDialogVisible.value = false
  batchDescriptions.value = [{ text: '' }]
}

// 确认批量添加描述
const confirmBatchAddDescription = async descriptions => {
  // 从事件参数获取描述数据
  const validDescriptions = descriptions
    .map(desc => desc.text.trim())
    .filter(text => text.length > 0)

  if (validDescriptions.length === 0) {
    ElMessage.warning('至少需要输入一条描述')
    return
  }

  const filesToAddDesc = selectedFilesInLibrary.value
  if (filesToAddDesc.length === 0) {
    ElMessage.warning('请选择已添加到媒体库的文件')
    return
  }

  batchDescriptionLoading.value = true
  try {
    // 构建批量添加描述的数据
    const items = filesToAddDesc.map(file => ({
      id: file.mediaId,
      texts: validDescriptions
    }))

    const response = await batchAddDescription(items)

    if (response.code === 200 || response.code === 207) {
      const data = response.data
      const successCount = data.successCount || 0
      const failCount = data.failCount || 0
      const errors = data.errors || []

      if (successCount > 0) {
        if (failCount > 0) {
          // 部分成功，显示警告并记录详细错误
          ElMessage.warning(`成功为 ${successCount} 个文件添加描述，${failCount} 个失败`)
          if (errors.length > 0) {
            logger.error('批量添加描述部分失败:', errors)
            // 显示前3个错误信息
            const errorPreview = errors
              .slice(0, 3)
              .map(e => e.error || '未知错误')
              .join('; ')
            if (errors.length > 3) {
              ElMessage.info(`部分错误: ${errorPreview}... (共 ${errors.length} 个错误)`)
            } else {
              ElMessage.info(`错误详情: ${errorPreview}`)
            }
          }
        } else {
          ElMessage.success(`成功为 ${successCount} 个文件添加描述`)
        }
        handleBatchDescriptionDialogClose()
        selectedFiles.value = []
        await loadFileList()
      } else {
        // 全部失败
        const errorMessage =
          errors.length > 0 ? errors[0].error || '批量添加描述失败' : '批量添加描述失败'
        ElMessage.error(errorMessage)
        if (errors.length > 1) {
          logger.error('批量添加描述失败:', errors)
        }
      }
    } else {
      ElMessage.error(response.message || '批量添加描述失败')
    }
  } catch (error) {
    logger.error('批量添加描述失败:', error)
    ElMessage.error(error.message || '批量添加描述失败')
  } finally {
    batchDescriptionLoading.value = false
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
  }

  .el-divider {
    margin: 20px 0;
  }
}
</style>
