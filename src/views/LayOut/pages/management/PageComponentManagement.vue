<template>
  <div class="page-component-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>组件管理</span>
          <div>
            <el-button type="primary" @click="handleCreate" :icon="Plus"> 新增组件 </el-button>
            <el-button @click="loadComponentList" :loading="loading" :icon="Refresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索组件名称"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterDisplayType"
          placeholder="展示类型"
          clearable
          style="width: 150px; margin-left: 10px"
          @change="handleFilterChange"
        >
          <el-option
            v-for="option in displayTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select
          v-model="filterIsActive"
          placeholder="状态"
          clearable
          style="width: 120px; margin-left: 10px"
          @change="handleFilterChange"
        >
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
      </div>

      <!-- 组件表格 -->
      <el-table
        v-loading="loading"
        :data="componentList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无组件数据'"
      >
        <el-table-column prop="name" label="组件名称" width="200" />
        <el-table-column prop="displayType" label="展示类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getDisplayTypeTagType(row.displayType)">
              {{ getDisplayTypeLabel(row.displayType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="组件项数量" width="120" align="center">
          <template #default="{ row }">
            {{ row.items?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="80" align="center" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive !== false ? 'success' : 'danger'">
              {{ row.isActive !== false ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.createdAt ? new Date(row.createdAt).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)"> 编辑 </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination" v-if="componentList.length > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="getPageSizeOptions('standard')"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑组件对话框 -->
    <ModernDialog
      v-model="editDialogVisible"
      :title="isEdit ? '编辑组件' : '新增组件'"
      :close-on-click-modal="false"
      confirm-text="确定"
      :confirm-loading="editLoading"
      @confirm="confirmEdit"
      @close="handleDialogClose"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="组件名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入组件名称" />
        </el-form-item>
        <el-form-item label="展示类型" prop="displayType">
          <el-select
            v-model="editForm.displayType"
            placeholder="请选择展示类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in displayTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="editForm.order" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="editForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <!-- 组件项管理 -->
        <el-form-item label="组件项">
          <div class="items-container">
            <div v-for="(item, itemIndex) in editForm.items" :key="itemIndex" class="item-card">
              <div class="item-header">
                <span class="item-title">组件项 {{ itemIndex + 1 }}</span>
                <el-button type="danger" size="small" :icon="Delete" @click="removeItem(itemIndex)">
                  删除
                </el-button>
              </div>
              <div class="item-content">
                <!-- 媒体选择 -->
                <div class="media-section">
                  <div class="section-label">媒体</div>
                  <div v-if="item.media?.url" class="media-preview">
                    <el-image
                      v-if="item.media.type === 'image'"
                      :src="getMediaUrl(item.media.url)"
                      fit="cover"
                      style="width: 150px; height: 150px; border-radius: 4px"
                      :preview-src-list="[getMediaUrl(item.media.url)]"
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <video
                      v-else-if="item.media.type === FILE_TYPES.VIDEO"
                      :src="getMediaUrl(item.media.url)"
                      controls
                      style="width: 150px; height: 150px; border-radius: 4px"
                    />
                    <div class="media-info">
                      <div>{{ item.media.filename || '未命名' }}</div>
                      <div class="media-type-tag">
                        <el-tag
                          :type="item.media.type === 'image' ? 'success' : 'primary'"
                          size="small"
                        >
                          {{ item.media.type === 'image' ? '图片' : '视频' }}
                        </el-tag>
                      </div>
                    </div>
                    <el-button type="primary" size="small" @click="openMediaSelector(itemIndex)">
                      更换媒体
                    </el-button>
                  </div>
                  <el-button
                    v-else
                    type="primary"
                    :icon="Plus"
                    @click="openMediaSelector(itemIndex)"
                  >
                    选择媒体
                  </el-button>
                </div>

                <!-- 描述列表 -->
                <div class="descriptions-section">
                  <div class="section-label">描述</div>
                  <div
                    v-for="(desc, descIndex) in item.descriptions"
                    :key="descIndex"
                    class="description-item"
                  >
                    <el-input
                      v-model="item.descriptions[descIndex].text"
                      placeholder="请输入描述文本"
                      @blur="handleDescriptionBlur(itemIndex, descIndex)"
                    />
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      @click="removeDescription(itemIndex, descIndex)"
                    >
                      删除
                    </el-button>
                  </div>
                  <el-button
                    type="primary"
                    size="small"
                    :icon="Plus"
                    @click="addDescription(itemIndex)"
                  >
                    添加描述
                  </el-button>
                </div>
              </div>
            </div>
            <el-button
              type="primary"
              :icon="Plus"
              @click="addItem"
              style="width: 100%; margin-top: 10px"
            >
              添加组件项
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </ModernDialog>

    <!-- 媒体选择对话框 -->
    <ModernDialog
      v-model="mediaSelectorVisible"
      title="选择媒体"
      :close-on-click-modal="false"
      :confirm-loading="mediaLoading"
      confirm-text="确定"
      @confirm="confirmMediaSelection"
    >
      <div class="media-selector">
        <div class="media-filter">
          <el-input
            v-model="mediaSearchKeyword"
            placeholder="搜索媒体"
            style="width: 300px"
            clearable
            @input="handleMediaSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="mediaFilterType"
            placeholder="媒体类型"
            clearable
            style="width: 150px; margin-left: 10px"
            @change="loadMediaList"
          >
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
          </el-select>
        </div>
        <div class="media-list" v-loading="mediaLoading">
          <div
            v-for="media in mediaList"
            :key="media._id"
            class="media-item"
            :class="{ selected: selectedMedia?._id === media._id }"
            @click="selectMedia(media)"
          >
            <el-image
              v-if="media.type === 'image'"
              :src="getMediaUrl(media.url)"
              fit="cover"
              style="width: 100%; height: 150px"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <video
              v-else
              :src="getMediaUrl(media.url)"
              style="width: 100%; height: 150px; object-fit: cover"
            />
            <div class="media-item-info">
              <div class="media-item-name">{{ media.filename || '未命名' }}</div>
              <el-tag :type="media.type === 'image' ? 'success' : 'primary'" size="small">
                {{ media.type === 'image' ? '图片' : '视频' }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="media-pagination" v-if="mediaTotal > 0">
          <el-pagination
            v-model:current-page="mediaCurrentPage"
            v-model:page-size="mediaPageSize"
            :page-sizes="getPageSizeOptions('media')"
            :total="mediaTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleMediaSizeChange"
            @current-change="handleMediaPageChange"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="mediaSelectorVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="mediaLoading"
          :disabled="!selectedMedia"
          @click="confirmMediaSelection"
        >
          确定
        </el-button>
      </template>
    </ModernDialog>
  </div>
</template>

<script setup>
import { Plus, Delete, Search, Refresh, Picture } from '@element-plus/icons-vue'
import {
  getPageComponentList,
  createPageComponent,
  updatePageComponent,
  deletePageComponent,
  getPageComponentById
} from '@/api/pageComponent'
import { getMediaList } from '@/api/media'
import ModernDialog from '@/components/ModernDialog.vue'
import {
  getDisplayTypeLabel,
  getDisplayTypeTagType,
  getDisplayTypeOptions,
  DEFAULT_DISPLAY_TYPE
} from '@/config/displayType'
import { DEFAULT_PAGE, getDefaultPageSize, getPageSizeOptions } from '@/config/pagination'
import { FILE_TYPES } from '@/config/fileType'

defineOptions({
  name: 'PageComponentManagement'
})

const searchKeyword = ref('')
const filterDisplayType = ref('')
const filterIsActive = ref(null)
const loading = ref(false)
const currentPage = ref(DEFAULT_PAGE)
const pageSize = ref(getDefaultPageSize('list'))
const total = ref(0)
const componentList = ref([])

// 编辑相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const isEdit = ref(false)
const editForm = ref({
  _id: '',
  name: '',
  displayType: DEFAULT_DISPLAY_TYPE,
  items: [],
  order: 0,
  isActive: true
})

// 表单验证规则
const editRules = {
  name: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
  displayType: [{ required: true, message: '请选择展示类型', trigger: 'change' }]
}

// 媒体选择器相关
const mediaSelectorVisible = ref(false)
const mediaLoading = ref(false)
const mediaList = ref([])
const mediaCurrentPage = ref(DEFAULT_PAGE)
const mediaPageSize = ref(getDefaultPageSize('media'))
const mediaTotal = ref(0)
const mediaSearchKeyword = ref('')
const mediaFilterType = ref('')
const selectedMedia = ref(null)
const currentItemIndex = ref(-1)

// 展示类型选项
const displayTypeOptions = getDisplayTypeOptions()

// 加载组件列表
const loadComponentList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }
    if (filterDisplayType.value) {
      params.displayType = filterDisplayType.value
    }
    if (filterIsActive.value !== null) {
      params.isActive = filterIsActive.value
    }

    const response = await getPageComponentList(params)
    if (response.code === 200 && response.data) {
      componentList.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取组件列表失败')
    }
  } catch (error) {
    console.error('加载组件列表失败:', error)
    ElMessage.error(error.message || '获取组件列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadComponentList()
})

// 搜索处理（防抖）
let searchTimer = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    currentPage.value = DEFAULT_PAGE
    loadComponentList()
  }, 500)
}

// 筛选处理
const handleFilterChange = () => {
  currentPage.value = DEFAULT_PAGE
  loadComponentList()
}

// 创建组件
const handleCreate = () => {
  isEdit.value = false
  editForm.value = {
    _id: '',
    name: '',
    displayType: DEFAULT_DISPLAY_TYPE,
    items: [],
    order: 0,
    isActive: true
  }
  editDialogVisible.value = true
}

// 编辑组件
const handleEdit = async row => {
  try {
    loading.value = true
    const response = await getPageComponentById(row._id || row.id)
    if (response.code === 200 && response.data) {
      isEdit.value = true
      const data = response.data
      editForm.value = {
        _id: data._id?.toString() || data._id, // 确保 ID 是字符串
        name: data.name || '',
        displayType: data.displayType || DEFAULT_DISPLAY_TYPE,
        items: (data.items || []).map(item => ({
          media: {
            mediaId: item.media?.mediaId?.toString() || item.media?.mediaId || null,
            url: item.media?.url || '',
            type: item.media?.type || 'image',
            filename: item.media?.filename || ''
          },
          descriptions: (item.descriptions || []).map(desc => ({
            text: typeof desc === 'string' ? desc : desc.text || '',
            createdAt: desc.createdAt || new Date()
          }))
        })),
        order: data.order || 0,
        isActive: data.isActive !== false
      }
      editDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取组件详情失败')
    }
  } catch (error) {
    console.error('获取组件详情失败:', error)
    ElMessage.error(error.message || '获取组件详情失败')
  } finally {
    loading.value = false
  }
}

// 删除组件
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(
      `确定要删除组件 "${row.name}" 吗？如果该组件正在被页面使用，将无法删除。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await deletePageComponent(row._id || row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadComponentList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组件失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 确认编辑
const confirmEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    // 验证至少有一个组件项
    if (editForm.value.items.length === 0) {
      ElMessage.warning('请至少添加一个组件项')
      return
    }

    // 验证每个组件项都有媒体
    for (let i = 0; i < editForm.value.items.length; i++) {
      const item = editForm.value.items[i]
      if (!item.media || !item.media.url) {
        ElMessage.warning(`组件项 ${i + 1} 缺少媒体`)
        return
      }
      // 确保 media.type 存在
      if (!item.media.type) {
        ElMessage.warning(`组件项 ${i + 1} 缺少媒体类型`)
        return
      }
      // 确保 media.type 是有效的值
      if (![FILE_TYPES.IMAGE, FILE_TYPES.VIDEO].includes(item.media.type)) {
        ElMessage.warning(
          `组件项 ${i + 1} 的媒体类型无效，必须是 ${FILE_TYPES.IMAGE} 或 ${FILE_TYPES.VIDEO}`
        )
        return
      }
    }

    editLoading.value = true

    const submitData = {
      name: editForm.value.name.trim(),
      displayType: editForm.value.displayType,
      items: editForm.value.items.map(item => ({
        media: {
          mediaId: item.media?.mediaId?.toString() || item.media?.mediaId || null,
          url: item.media?.url || '',
          type: item.media?.type || FILE_TYPES.IMAGE, // 确保有默认值
          filename: item.media?.filename || ''
        },
        descriptions: (item.descriptions || []).map(desc => ({
          text: typeof desc === 'string' ? desc : desc.text || '',
          createdAt: desc.createdAt || new Date()
        }))
      })),
      order: editForm.value.order || 0,
      isActive: editForm.value.isActive
    }

    let response
    if (isEdit.value) {
      response = await updatePageComponent(editForm.value._id, submitData)
    } else {
      response = await createPageComponent(submitData)
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      editDialogVisible.value = false
      loadComponentList()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error('保存组件失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    editLoading.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  editFormRef.value?.resetFields()
  editForm.value = {
    _id: '',
    name: '',
    displayType: DEFAULT_DISPLAY_TYPE,
    items: [],
    order: 0,
    isActive: true
  }
  currentItemIndex.value = -1
  selectedMedia.value = null
}

// 添加组件项
const addItem = () => {
  editForm.value.items.push({
    media: {
      mediaId: null,
      url: '',
      type: FILE_TYPES.IMAGE, // 默认类型
      filename: ''
    },
    descriptions: []
  })
}

// 删除组件项
const removeItem = index => {
  editForm.value.items.splice(index, 1)
}

// 添加描述
const addDescription = itemIndex => {
  if (!editForm.value.items[itemIndex].descriptions) {
    editForm.value.items[itemIndex].descriptions = []
  }
  editForm.value.items[itemIndex].descriptions.push({
    text: '',
    createdAt: new Date()
  })
}

// 删除描述
const removeDescription = (itemIndex, descIndex) => {
  editForm.value.items[itemIndex].descriptions.splice(descIndex, 1)
}

// 描述失焦处理
const handleDescriptionBlur = (itemIndex, descIndex) => {
  const desc = editForm.value.items[itemIndex].descriptions[descIndex]
  if (desc && !desc.createdAt) {
    desc.createdAt = new Date()
  }
}

// 打开媒体选择器
const openMediaSelector = itemIndex => {
  currentItemIndex.value = itemIndex
  selectedMedia.value = null
  mediaSelectorVisible.value = true
  loadMediaList()
}

// 加载媒体列表
const loadMediaList = async () => {
  mediaLoading.value = true
  try {
    const params = {
      page: mediaCurrentPage.value,
      limit: mediaPageSize.value
    }

    if (mediaFilterType.value) {
      params.type = mediaFilterType.value
    }
    if (mediaSearchKeyword.value) {
      params.description = mediaSearchKeyword.value
    }

    const response = await getMediaList(params)
    if (response.code === 200 && response.data) {
      mediaList.value = response.data.list || []
      mediaTotal.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取媒体列表失败')
    }
  } catch (error) {
    console.error('加载媒体列表失败:', error)
    ElMessage.error(error.message || '获取媒体列表失败')
  } finally {
    mediaLoading.value = false
  }
}

// 媒体搜索处理
let mediaSearchTimer = null
const handleMediaSearch = () => {
  if (mediaSearchTimer) {
    clearTimeout(mediaSearchTimer)
  }
  mediaSearchTimer = setTimeout(() => {
    mediaCurrentPage.value = DEFAULT_PAGE
    loadMediaList()
  }, 500)
}

// 选择媒体
const selectMedia = media => {
  selectedMedia.value = media
}

// 确认媒体选择
const confirmMediaSelection = () => {
  if (!selectedMedia.value || currentItemIndex.value === -1) {
    ElMessage.warning('请选择媒体')
    return
  }

  const item = editForm.value.items[currentItemIndex.value]
  if (!item) {
    ElMessage.error('组件项不存在')
    return
  }

  // 确保 mediaId 是字符串格式
  const mediaId = selectedMedia.value._id?.toString() || selectedMedia.value._id

  item.media = {
    mediaId: mediaId,
    url: selectedMedia.value.url || '',
    type: selectedMedia.value.type || FILE_TYPES.IMAGE, // 确保有默认值
    filename: selectedMedia.value.filename || ''
  }

  // 如果 descriptions 不存在，初始化为空数组
  if (!item.descriptions || !Array.isArray(item.descriptions)) {
    item.descriptions = []
  }

  mediaSelectorVisible.value = false
  selectedMedia.value = null
  currentItemIndex.value = -1
}

// 媒体分页处理
const handleMediaSizeChange = val => {
  mediaPageSize.value = val
  mediaCurrentPage.value = 1
  loadMediaList()
}

const handleMediaPageChange = val => {
  mediaCurrentPage.value = val
  loadMediaList()
}

// 获取媒体URL
const getMediaUrl = url => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const baseUrl = import.meta.env.VITE_API_PREFIX || '/api'
  if (baseUrl.startsWith('http')) {
    return `${baseUrl}${url}`
  }
  return `${window.location.protocol}//${window.location.host}${baseUrl}${url}`
}

// 使用公共配置的展示类型函数（已从 @/config/displayType 导入）

// 分页处理
const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = DEFAULT_PAGE
  loadComponentList()
}

const handlePageChange = val => {
  currentPage.value = val
  loadComponentList()
}
</script>

<style lang="scss" scoped>
.page-component-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .search-bar {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .items-container {
    width: 100%;
  }

  .item-card {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #fafafa;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  .item-title {
    font-weight: 600;
    font-size: 14px;
  }

  .item-content {
    display: flex;
    gap: 20px;
  }

  .media-section,
  .descriptions-section {
    flex: 1;
  }

  .section-label {
    font-weight: 500;
    margin-bottom: 10px;
    color: #606266;
  }

  .media-preview {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .media-info {
    font-size: 12px;
    color: #909399;
  }

  .media-type-tag {
    margin-top: 5px;
  }

  .description-item {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .description-item .el-input {
    flex: 1;
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
  }

  .media-selector {
    .media-filter {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .media-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      min-height: 200px;
      max-height: 500px;
      overflow-y: auto;
      padding: 10px;
    }

    .media-item {
      border: 2px solid #e4e7ed;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }

      &.selected {
        border-color: #409eff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    .media-item-info {
      padding: 8px;
      background-color: #fff;
    }

    .media-item-name {
      font-size: 12px;
      color: #606266;
      margin-bottom: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .media-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
