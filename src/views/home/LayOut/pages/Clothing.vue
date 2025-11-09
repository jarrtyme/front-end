<template>
  <div class="clothing-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>服装管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加服装
          </el-button>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-input v-model="searchKeyword" placeholder="搜索服装名称" style="width: 300px" clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="选择分类" style="width: 200px" clearable>
          <el-option label="上衣" value="top" />
          <el-option label="裤子" value="pants" />
          <el-option label="鞋子" value="shoes" />
        </el-select>
      </div>

      <!-- 服装表格 -->
      <el-table :data="clothingList" style="width: 100%" v-loading="loading">
        <el-table-column prop="_id" label="ID" width="80">
          <template #default="{ row }">
            {{ row._id || row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="200">
          <template #default="{ row }">
            {{ row.name || row.itemName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ getCategoryName(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }"> ¥{{ row.price || row.unitPrice || 0 }} </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            {{ row.stock || row.quantity || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.image || row.imageUrl"
              :src="row.image || row.imageUrl"
              style="width: 80px; height: 80px"
              fit="cover"
            />
            <span v-else>无图片</span>
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
      <div class="pagination">
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
  </div>
</template>

<script setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { findClothing, removeClothing } from '@/api/clothing'

defineOptions({
  name: 'Clothing'
})

const searchKeyword = ref('')
const categoryFilter = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const clothingList = ref([])

// 加载服装列表
const loadClothingList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    // 添加查询条件
    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }
    if (categoryFilter.value) {
      params.category = categoryFilter.value
    }

    const response = await findClothing(params)
    if (response.code === 200 && response.data) {
      clothingList.value = response.data.clothing || response.data.list || response.data || []
      total.value = response.data.total || response.data.count || clothingList.value.length
    } else {
      ElMessage.error(response.message || '获取服装列表失败')
    }
  } catch (error) {
    console.error('加载服装列表失败:', error)
    ElMessage.error(error.message || '获取服装列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadClothingList()
})

// 监听筛选条件变化
watch([searchKeyword, categoryFilter], () => {
  currentPage.value = 1
  loadClothingList()
})

const getCategoryName = category => {
  const map = {
    top: '上衣',
    pants: '裤子',
    shoes: '鞋子'
  }
  return map[category] || category
}

const handleAdd = () => {
  ElMessage.info('添加服装功能开发中...')
}

const handleEdit = row => {
  ElMessage.info(`编辑服装: ${row.name || row.itemName}`)
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除服装 "${row.name || row.itemName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await removeClothing(row._id || row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadClothingList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除服装失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = 1
  loadClothingList()
}

const handlePageChange = val => {
  currentPage.value = val
  loadClothingList()
}
</script>

<style lang="scss" scoped>
.clothing-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .filter-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
