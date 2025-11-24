<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 用户表格 -->
      <el-table :data="userList" style="width: 100%" v-loading="loading">
        <el-table-column prop="_id" label="ID" width="80">
          <template #default="{ row }">
            {{ row._id || row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role, row.vipLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vipLevel" label="VIP等级" width="100" v-if="showVipColumn">
          <template #default="{ row }">
            <span v-if="row.role === ROLES.VIP && row.vipLevel">{{ row.vipLevel }}</span>
            <span v-else>-</span>
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
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link size="small" @click="gotoMenuPermission(row)">
              菜单权限
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
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

    <!-- 编辑用户对话框 -->
    <ModernDialog
      v-model="editDialogVisible"
      title="编辑用户"
      confirm-text="确定"
      :confirm-loading="editLoading"
      @confirm="confirmEdit"
      @close="handleDialogClose"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option :label="getRoleLabel(ROLES.USER)" :value="ROLES.USER" />
            <el-option :label="getRoleLabel(ROLES.VIP)" :value="ROLES.VIP" />
            <el-option :label="getRoleLabel(ROLES.ADMIN)" :value="ROLES.ADMIN" />
            <el-option
              v-if="isSuperAdmin(userStore.userRole)"
              :label="getRoleLabel(ROLES.SUPER_ADMIN)"
              :value="ROLES.SUPER_ADMIN"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.role === ROLES.VIP" label="VIP等级" prop="vipLevel">
          <el-input-number
            v-model="editForm.vipLevel"
            :min="0"
            :max="10"
            placeholder="VIP等级 (0-10)"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-switch v-model="editForm.isActive" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
    </ModernDialog>
  </div>
</template>

<script setup>
import { Plus, Search } from '@element-plus/icons-vue'
import { getUserList, deleteUser, updateUser } from '@/api/user'
import ModernDialog from '@/components/ModernDialog.vue'
import { getRoleTagType, getRoleLabel, isSuperAdmin, ROLES, DEFAULT_ROLE } from '@/config/role'
import { DEFAULT_PAGE, getDefaultPageSize, getPageSizeOptions } from '@/config/pagination'

defineOptions({
  name: 'Users'
})

const router = useRouter()

const searchKeyword = ref('')
const loading = ref(false)
const currentPage = ref(DEFAULT_PAGE)
const pageSize = ref(getDefaultPageSize('list'))
const total = ref(0)
const userList = ref([])

// 编辑相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editForm = ref({
  _id: '',
  username: '',
  email: '',
  role: ROLES.USER,
  vipLevel: 0,
  isActive: true
})

const userStore = useUserStore()

// 检查是否需要显示VIP列
const showVipColumn = computed(() => {
  return userList.value.some(user => user.role === ROLES.VIP)
})

// 表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    // 如果有搜索关键词，添加到查询参数（后端会使用 $or 查询）
    if (searchKeyword.value) {
      params.username = searchKeyword.value
    }

    const response = await getUserList(params)
    if (response.code === 200 && response.data) {
      userList.value = response.data.users || response.data.list || []
      total.value = response.data.total || response.data.count || userList.value.length
    } else {
      ElMessage.error(response.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error(error.message || '获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 初始化加载
onMounted(() => {
  loadUserList()
})

// 搜索处理（防抖）
let searchTimer = null
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    currentPage.value = DEFAULT_PAGE
    loadUserList()
  }, 500)
}

const handleAdd = () => {
  ElMessage.info('添加用户功能开发中...')
}

const handleEdit = row => {
  editForm.value = {
    _id: row._id || row.id,
    username: row.username || '',
    email: row.email || '',
    role: row.role || ROLES.USER,
    vipLevel: row.vipLevel || 0,
    isActive: row.isActive !== false
  }
  editDialogVisible.value = true
}

const gotoMenuPermission = row => {
  router.push({
    path: '/admin/menu-permission',
    query: { userId: row._id || row.id }
  })
}

const handleDialogClose = () => {
  editFormRef.value?.resetFields()
  editForm.value = {
    _id: '',
    username: '',
    email: '',
    role: ROLES.USER,
    vipLevel: 0,
    isActive: true
  }
}

const confirmEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    editLoading.value = true
    const { _id, ...updateData } = editForm.value
    const response = await updateUser(_id, updateData)

    if (response.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadUserList()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('更新用户失败:', error)
      ElMessage.error(error.message || '更新失败')
    }
  } finally {
    editLoading.value = false
  }
}

const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await deleteUser(row._id || row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadUserList()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

const handleSizeChange = val => {
  pageSize.value = val
  currentPage.value = 1
  loadUserList()
}

const handlePageChange = val => {
  currentPage.value = val
  loadUserList()
}
</script>

<style lang="scss" scoped>
.users-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 16px;
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
