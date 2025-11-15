<template>
  <div>
    <el-table
      :data="fileList"
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
            :preview-teleported="true"
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
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { Download, VideoPlay, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  fileList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 10, total: 0 })
  }
})

const emit = defineEmits([
  'selection-change',
  'page-change',
  'size-change',
  'video-preview',
  'download',
  'add-to-media-library',
  'delete',
  'open-description-dialog'
])

// 工具函数
const isImage = filename => {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    '.tiff',
    '.tif',
    '.heic',
    '.heif',
    '.avif',
    '.jfif',
    '.jp2',
    '.jpx',
    '.j2k',
    '.j2c',
    '.psd',
    '.raw',
    '.cr2',
    '.nef',
    '.orf',
    '.sr2'
  ]
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

const isVideo = filename => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

const isImageOrVideo = row => {
  return row.fileType === 'image' || row.fileType === 'video'
}

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

const formatFileSize = size => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

const getFileTypeFromName = filename => {
  if (!filename) return 'other'
  const ext = filename.toLowerCase().split('.').pop()

  if (
    [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'bmp',
      'svg',
      'ico',
      'tiff',
      'tif',
      'heic',
      'heif',
      'avif',
      'jfif',
      'jp2',
      'jpx',
      'j2k',
      'j2c',
      'psd',
      'raw',
      'cr2',
      'nef',
      'orf',
      'sr2'
    ].includes(ext)
  )
    return 'image'
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'].includes(ext)) return 'video'
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive'
  if (['txt', 'csv', 'json', 'xml', 'md'].includes(ext)) return 'text'
  return 'other'
}

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

const getMediaDescriptions = row => {
  return row.descriptions || []
}

// 事件处理
const handleSelectionChange = selection => {
  emit('selection-change', selection)
}

const handlePageChange = page => {
  emit('page-change', page)
}

const handleSizeChange = size => {
  emit('size-change', size)
}

const handleVideoPreview = row => {
  emit('video-preview', row)
}

const handleVideoHover = (event, isEnter) => {
  const video = event.target
  if (isEnter) {
    video.play().catch(() => {})
  } else {
    video.pause()
    video.currentTime = 0
  }
}

const handleDownload = row => {
  emit('download', row)
}

const handleAddToMediaLibrary = row => {
  emit('add-to-media-library', row)
}

const handleDelete = row => {
  emit('delete', row)
}

const handleOpenDescriptionDialog = row => {
  emit('open-description-dialog', row)
}
</script>

<style lang="scss" scoped>
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

.descriptions-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
