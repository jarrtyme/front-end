<template>
  <div class="page-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>页面管理</span>
          <div>
            <el-button type="primary" @click="handleCreate" :icon="Plus"> 新增页面 </el-button>
            <el-button @click="loadPageList" :loading="loading" :icon="Refresh"> 刷新 </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索页面名称"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filterIsPublished"
          placeholder="发布状态"
          clearable
          style="width: 120px; margin-left: 10px"
          @change="handleFilterChange"
        >
          <el-option label="已发布" :value="true" />
          <el-option label="未发布" :value="false" />
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

      <!-- 页面表格 -->
      <el-table
        v-loading="loading"
        :data="pageList"
        stripe
        style="width: 100%"
        :empty-text="loading ? '加载中...' : '暂无页面数据'"
      >
        <el-table-column prop="name" label="页面名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="组件数量" width="120" align="center">
          <template #default="{ row }">
            {{ row.componentIds?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="80" align="center" />
        <el-table-column prop="isPublished" label="发布状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isPublished ? 'success' : 'info'">
              {{ row.isPublished ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)"> 编辑 </el-button>
            <el-button
              :type="row.isPublished ? 'warning' : 'success'"
              link
              size="small"
              @click="handleTogglePublish(row)"
            >
              {{ row.isPublished ? '取消发布' : '发布' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination" v-if="pageList.length > 0">
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

    <!-- 创建/编辑页面对话框 -->
    <ModernDialog
      v-model="editDialogVisible"
      :title="isEdit ? '编辑页面' : '新增页面'"
      :close-on-click-modal="false"
      confirm-text="确定"
      :confirm-loading="editLoading"
      @confirm="confirmEdit"
      @close="handleDialogClose"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="页面名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入页面名称" />
        </el-form-item>
        <el-form-item label="页面描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入页面描述"
          />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="editForm.order" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="editForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="发布状态" prop="isPublished">
          <el-switch v-model="editForm.isPublished" active-text="已发布" inactive-text="未发布" />
        </el-form-item>

        <!-- 组件选择 -->
        <el-form-item label="页面组件">
          <div class="components-section">
            <div class="components-header">
              <span>已选组件 ({{ selectedComponents.length }})</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openComponentSelector">
                选择组件
              </el-button>
            </div>
            <div v-if="selectedComponents.length === 0" class="empty-components">
              <el-empty description="暂无组件，请先选择组件" :image-size="80" />
            </div>
            <div v-else class="components-list">
              <div
                v-for="(component, index) in selectedComponents"
                :key="component._id || index"
                class="component-item"
              >
                <div class="component-info">
                  <div class="component-order">{{ index + 1 }}</div>
                  <div class="component-details">
                    <div class="component-name">{{ component.name }}</div>
                    <div class="component-meta">
                      <el-tag :type="getDisplayTypeTagType(component.displayType)" size="small">
                        {{ getDisplayTypeLabel(component.displayType) }}
                      </el-tag>
                      <span class="component-items-count">
                        {{ component.items?.length || 0 }} 个组件项
                      </span>
                    </div>
                  </div>
                </div>
                <div class="component-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :icon="ArrowUp"
                    :disabled="index === 0"
                    @click="moveComponent(index, 'up')"
                  >
                    上移
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    :icon="ArrowDown"
                    :disabled="index === selectedComponents.length - 1"
                    @click="moveComponent(index, 'down')"
                  >
                    下移
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    @click="removeComponent(index)"
                  >
                    移除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </ModernDialog>

    <!-- 组件选择对话框 -->
    <ModernDialog
      v-model="componentSelectorVisible"
      title="选择组件"
      :close-on-click-modal="false"
      :confirm-loading="componentLoading"
      confirm-text="确定"
      @confirm="confirmComponentSelection"
    >
      <div class="component-selector">
        <div class="component-filter">
          <el-input
            v-model="componentSearchKeyword"
            placeholder="搜索组件名称"
            style="width: 300px"
            clearable
            @input="handleComponentSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select
            v-model="componentFilterDisplayType"
            placeholder="展示类型"
            clearable
            style="width: 150px; margin-left: 10px"
            @change="loadComponentList"
          >
            <el-option
              v-for="option in displayTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="componentFilterIsActive"
            placeholder="状态"
            clearable
            style="width: 120px; margin-left: 10px"
            @change="loadComponentList"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </div>
        <div class="component-list" v-loading="componentLoading">
          <el-table
            ref="componentTableRef"
            :data="availableComponents"
            @selection-change="handleComponentSelectionChange"
            max-height="400"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="组件名称" width="200" />
            <el-table-column prop="displayType" label="展示类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getDisplayTypeTagType(row.displayType)" size="small">
                  {{ getDisplayTypeLabel(row.displayType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="组件项数量" width="120" align="center">
              <template #default="{ row }">
                {{ row.items?.length || 0 }}
              </template>
            </el-table-column>
            <el-table-column prop="isActive" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.isActive !== false ? 'success' : 'danger'" size="small">
                  {{ row.isActive !== false ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="component-pagination" v-if="componentTotal > 0">
          <el-pagination
            v-model:current-page="componentCurrentPage"
            v-model:page-size="componentPageSize"
            :page-sizes="getPageSizeOptions('component')"
            :total="componentTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleComponentSizeChange"
            @current-change="handleComponentPageChange"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="componentSelectorVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="componentLoading"
          :disabled="selectedComponentIds.length === 0"
          @click="confirmComponentSelection"
        >
          确定 ({{ selectedComponentIds.length }})
        </el-button>
      </template>
    </ModernDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getPageList, createPage, updatePage, deletePage, getPageById } from '@/api/page'
import { getPageComponentList } from '@/api/pageComponent'
import ModernDialog from '@/components/ModernDialog.vue'
import {
  getDisplayTypeLabel,
  getDisplayTypeTagType,
  getDisplayTypeOptions
} from '@/config/displayType'
import { DEFAULT_PAGE, getDefaultPageSize, getPageSizeOptions } from '@/config/pagination'

defineOptions({
  name: 'PageManagement'
})

const searchKeyword = ref('')
const filterIsPublished = ref(null)
const filterIsActive = ref(null)
const loading = ref(false)
const currentPage = ref(DEFAULT_PAGE)
const pageSize = ref(getDefaultPageSize('list'))
const total = ref(0)
const pageList = ref([])

// 编辑相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const isEdit = ref(false)
const editForm = ref({
  _id: '',
  name: '',
  description: '',
  componentIds: [],
  order: 0,
  isActive: true,
  isPublished: false
})

// 已选择的组件（完整对象）
const selectedComponents = ref([])

// 表单验证规则
const editRules = {
  name: [{ required: true, message: '请输入页面名称', trigger: 'blur' }]
}

// 组件选择器相关
const componentSelectorVisible = ref(false)
const componentLoading = ref(false)
const availableComponents = ref([])
const componentCurrentPage = ref(DEFAULT_PAGE)
const componentPageSize = ref(getDefaultPageSize('component'))
const componentTotal = ref(0)
const componentSearchKeyword = ref('')
const componentFilterDisplayType = ref('')
const componentFilterIsActive = ref(null)
const selectedComponentIds = ref([])
const componentTableRef = ref(null)

// 展示类型选项
const displayTypeOptions = getDisplayTypeOptions()

// 加载页面列表
const loadPageList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }
    if (filterIsPublished.value !== null) {
      params.isPublished = filterIsPublished.value
    }
    if (filterIsActive.value !== null) {
      params.isActive = filterIsActive.value
    }

    const response = await getPageList(params)
    if (response.code === 200 && response.data) {
      pageList.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取页面列表失败')
    }
  } catch (error) {
    console.error('加载页面列表失败:', error)
    ElMessage.error(error.message || '获取页面列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadPageList()
})

// 搜索处理（防抖）
let searchTimer = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    currentPage.value = DEFAULT_PAGE
    loadPageList()
  }, 500)
}

// 筛选处理
const handleFilterChange = () => {
  currentPage.value = DEFAULT_PAGE
  loadPageList()
}

// 创建页面
const handleCreate = () => {
  isEdit.value = false
  editForm.value = {
    _id: '',
    name: '',
    description: '',
    componentIds: [],
    order: 0,
    isActive: true,
    isPublished: false
  }
  selectedComponents.value = []
  editDialogVisible.value = true
}

// 编辑页面
const handleEdit = async row => {
  try {
    loading.value = true
    const response = await getPageById(row._id || row.id)
    if (response.code === 200 && response.data) {
      isEdit.value = true
      const data = response.data
      editForm.value = {
        _id: data._id,
        name: data.name || '',
        description: data.description || '',
        componentIds: (data.componentIds || []).map(c => c._id || c),
        order: data.order || 0,
        isActive: data.isActive !== false,
        isPublished: data.isPublished || false
      }
      // 设置已选择的组件（从填充的数据中获取）
      selectedComponents.value = (data.componentIds || []).filter(c => c && typeof c === 'object')
      editDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取页面详情失败')
    }
  } catch (error) {
    console.error('获取页面详情失败:', error)
    ElMessage.error(error.message || '获取页面详情失败')
  } finally {
    loading.value = false
  }
}

// 删除页面
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除页面 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await deletePage(row._id || row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadPageList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除页面失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 切换发布状态
const handleTogglePublish = async row => {
  try {
    const action = row.isPublished ? '取消发布' : '发布'
    await ElMessageBox.confirm(`确定要${action}页面 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await updatePage(row._id || row.id, {
      isPublished: !row.isPublished
    })
    if (response.code === 200) {
      ElMessage.success(`${action}成功`)
      loadPageList()
    } else {
      ElMessage.error(response.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换发布状态失败:', error)
      ElMessage.error(error.message || '操作失败')
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

    editLoading.value = true

    // 从已选择的组件中提取ID
    const componentIds = selectedComponents.value.map(c => c._id || c.id || c)

    const submitData = {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim(),
      componentIds: componentIds,
      order: editForm.value.order || 0,
      isActive: editForm.value.isActive,
      isPublished: editForm.value.isPublished
    }

    let response
    if (isEdit.value) {
      response = await updatePage(editForm.value._id, submitData)
    } else {
      response = await createPage(submitData)
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      editDialogVisible.value = false
      loadPageList()
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error('保存页面失败:', error)
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
    description: '',
    componentIds: [],
    order: 0,
    isActive: true,
    isPublished: false
  }
  selectedComponents.value = []
}

// 打开组件选择器
const openComponentSelector = async () => {
  componentSelectorVisible.value = true
  selectedComponentIds.value = []
  // 预设已选择的组件ID
  const currentIds = selectedComponents.value.map(c => {
    const id = c._id || c.id || c
    return String(id)
  })

  await loadComponentList()

  // 延迟设置选中状态，等待表格渲染完成
  await nextTick()
  if (componentTableRef.value && availableComponents.value.length > 0) {
    availableComponents.value.forEach(component => {
      const componentId = String(component._id || component.id)
      if (currentIds.includes(componentId)) {
        componentTableRef.value.toggleRowSelection(component, true)
        selectedComponentIds.value.push(componentId)
      }
    })
  }
}

// 加载组件列表
const loadComponentList = async () => {
  componentLoading.value = true
  try {
    const params = {
      page: componentCurrentPage.value,
      limit: componentPageSize.value
    }

    if (componentSearchKeyword.value) {
      params.name = componentSearchKeyword.value
    }
    if (componentFilterDisplayType.value) {
      params.displayType = componentFilterDisplayType.value
    }
    if (componentFilterIsActive.value !== null) {
      params.isActive = componentFilterIsActive.value
    }

    const response = await getPageComponentList(params)
    if (response.code === 200 && response.data) {
      availableComponents.value = response.data.list || []
      componentTotal.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取组件列表失败')
    }
  } catch (error) {
    console.error('加载组件列表失败:', error)
    ElMessage.error(error.message || '获取组件列表失败')
  } finally {
    componentLoading.value = false
  }
}

// 组件搜索处理
let componentSearchTimer = null
const handleComponentSearch = () => {
  if (componentSearchTimer) {
    clearTimeout(componentSearchTimer)
  }
  componentSearchTimer = setTimeout(() => {
    componentCurrentPage.value = 1
    loadComponentList()
  }, 500)
}

// 组件选择变化
const handleComponentSelectionChange = selection => {
  selectedComponentIds.value = selection.map(c => String(c._id || c.id))
}

// 确认组件选择
const confirmComponentSelection = () => {
  // 获取选中的组件完整对象
  const selectedIds = selectedComponentIds.value.map(id => String(id))
  const selected = availableComponents.value.filter(c => {
    const id = String(c._id || c.id)
    return selectedIds.includes(id)
  })

  // 合并到已选择的组件列表（避免重复）
  selected.forEach(component => {
    const id = String(component._id || component.id)
    const exists = selectedComponents.value.find(c => {
      const cId = String(c._id || c.id || c)
      return cId === id
    })
    if (!exists) {
      selectedComponents.value.push(component)
    }
  })

  componentSelectorVisible.value = false
  selectedComponentIds.value = []
}

// 移除组件
const removeComponent = index => {
  selectedComponents.value.splice(index, 1)
}

// 移动组件
const moveComponent = (index, direction) => {
  if (direction === 'up' && index > 0) {
    const temp = selectedComponents.value[index]
    selectedComponents.value[index] = selectedComponents.value[index - 1]
    selectedComponents.value[index - 1] = temp
  } else if (direction === 'down' && index < selectedComponents.value.length - 1) {
    const temp = selectedComponents.value[index]
    selectedComponents.value[index] = selectedComponents.value[index + 1]
    selectedComponents.value[index + 1] = temp
  }
}

// 组件分页处理
const handleComponentSizeChange = val => {
  componentPageSize.value = val
  componentCurrentPage.value = 1
  loadComponentList()
}

const handleComponentPageChange = val => {
  componentCurrentPage.value = val
  loadComponentList()
}

// 使用公共配置的展示类型函数（已从 @/config/displayType 导入）

// 分页处理
const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = DEFAULT_PAGE
  loadPageList()
}

const handlePageChange = val => {
  currentPage.value = val
  loadPageList()
}
</script>

<style lang="scss" scoped>
.page-management {
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

  .components-section {
    width: 100%;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    background-color: #fafafa;
  }

  .components-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 500;
  }

  .empty-components {
    padding: 40px 0;
  }

  .components-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .component-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .component-info {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
  }

  .component-order {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #409eff;
    color: #fff;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
  }

  .component-details {
    flex: 1;
  }

  .component-name {
    font-weight: 500;
    margin-bottom: 5px;
  }

  .component-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #909399;
  }

  .component-items-count {
    font-size: 12px;
  }

  .component-actions {
    display: flex;
    gap: 5px;
  }

  .component-selector {
    .component-filter {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }

    .component-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
