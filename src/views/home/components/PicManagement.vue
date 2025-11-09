<template>
  <div class="pic-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>图片管理</span>
          <el-button type="primary" @click="loadImageList" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入文件名进行搜索"
          clearable
          @input="handleSearch"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 图片表格 -->
      <el-table
        v-loading="loading"
        :data="filteredImageList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无图片'"
      >
        <el-table-column label="预览" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="getImageUrl(row.url || row.path)"
              :preview-src-list="[getImageUrl(row.url || row.path)]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px"
              :lazy="true"
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="filename" label="文件名" min-width="200" show-overflow-tooltip>
        </el-table-column>

        <el-table-column label="文件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>

        <el-table-column label="上传时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.uploadTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
              :loading="deletingRow === row.filename"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination" v-if="filteredImageList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredImageList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getImageList, deleteImage } from '@/api/upload'
import { Search, Refresh, Delete, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const imageList = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const deletingRow = ref(null)

// 计算属性：过滤后的图片列表
const filteredImageList = computed(() => {
  let filtered = imageList.value

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => item.filename.toLowerCase().includes(keyword))
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value

  console.log(filtered.slice(start, end))

  return filtered.slice(start, end)
})

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

// 格式化文件大小
const formatFileSize = bytes => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = dateString => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 加载图片列表
const loadImageList = async () => {
  loading.value = true
  try {
    const response = await getImageList()
    if (response.code === 200 && response.data) {
      imageList.value = response.data.images || []
      // 重置到第一页
      currentPage.value = 1
      ElMessage.success('图片列表加载成功')
    } else {
      ElMessage.error(response.message || '获取图片列表失败')
      imageList.value = []
    }
  } catch (error) {
    console.error('加载图片列表失败:', error)
    ElMessage.error(error.message || '加载图片列表失败')
    imageList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索时重置到第一页
  currentPage.value = 1
}

// 删除图片
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `确定要删除图片 "${row.filename}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deletingRow.value = row.filename
    try {
      const response = await deleteImage(row.filename)
      if (response.code === 200) {
        ElMessage.success('图片删除成功')
        // 重新加载列表
        await loadImageList()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除图片失败:', error)
      ElMessage.error(error.message || '删除图片失败')
    } finally {
      deletingRow.value = null
    }
  } catch {
    // 用户取消删除
  }
}

// 分页处理
const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = val => {
  currentPage.value = val
}

// 组件挂载时加载数据
onMounted(() => {
  loadImageList()
})
</script>

<style lang="scss" scoped>
.pic-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .image-error {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 4px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
