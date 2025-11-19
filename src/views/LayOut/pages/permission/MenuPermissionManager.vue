<template>
  <div class="menu-permission-page">
    <el-row :gutter="16">
      <!-- 用户列表 -->
      <el-col :xs="24" :lg="6">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span>用户列表</span>
              <el-button type="primary" link @click="loadUsers" :loading="userLoading"
                >刷新</el-button
              >
            </div>
          </template>
          <el-input
            v-model="userKeyword"
            placeholder="搜索用户名 / 邮箱"
            size="small"
            clearable
            @input="handleUserSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-table
            v-loading="userLoading"
            :data="filteredUsers"
            class="user-table"
            size="small"
            border
            :row-class-name="row => (row._id === selectedUserId ? 'is-active' : '')"
            @current-change="handleSelectUser"
          >
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="role" label="角色" width="150">
              <template #default="{ row }">
                <el-tag size="small" :type="roleTagType(row.role)">
                  {{ formatRole(row.role, row.vipLevel) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 菜单配置 -->
      <el-col :xs="24" :lg="11">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <div class="panel-title">
                <span>菜单权限配置</span>
                <el-tag v-if="selectedUserName" size="small" type="info">
                  当前用户：{{ selectedUserName }}
                </el-tag>
              </div>
              <div class="panel-actions">
                <el-tag v-if="!selectedUserId" size="small" type="warning">请选择用户</el-tag>
                <el-tag v-else size="small" :type="currentModeTagType">
                  {{ currentModeLabel }}
                </el-tag>
              </div>
            </div>
          </template>

          <el-empty v-if="!selectedUserId" description="请选择左侧用户查看菜单权限" />

          <div v-else class="menu-content">
            <div class="menu-actions">
              <el-button size="small" @click="handleSelectAll">全选</el-button>
              <el-button size="small" @click="handleClear">清空</el-button>
              <el-button size="small" @click="handleRestoreDefault">恢复默认</el-button>
              <el-button
                type="primary"
                size="small"
                :loading="saveLoading"
                :disabled="!isDirty"
                @click="handleSave"
              >
                保存
              </el-button>
            </div>

            <div class="menu-group" v-for="group in menuGroups" :key="group.key">
              <div class="group-header">
                <div class="group-title">
                  <span>{{ group.label }}</span>
                  <small v-if="group.description">{{ group.description }}</small>
                </div>
                <div class="group-tools" v-if="group.children && group.children.length">
                  <el-link type="primary" @click="setGroupPermissions(group.children, true)">
                    全选
                  </el-link>
                  <el-divider direction="vertical" />
                  <el-link type="info" @click="setGroupPermissions(group.children, false)">
                    清空
                  </el-link>
                </div>
              </div>
              <div v-if="group.children && group.children.length" class="group-body">
                <el-checkbox-group v-model="selectedPermissions">
                  <el-checkbox v-for="child in group.children" :key="child.key" :label="child.key">
                    {{ child.label }}
                    <small v-if="child.description">{{ child.description }}</small>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div v-else class="group-body single">
                <el-checkbox
                  :model-value="selectedPermissions.includes(group.key)"
                  @change="val => toggleSingle(group.key, val)"
                >
                  {{ group.label }}
                </el-checkbox>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 模板管理 -->
      <el-col :xs="24" :lg="7">
        <el-card class="panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span>权限模板</span>
              <div class="panel-actions">
                <el-button type="primary" size="small" @click="openTemplateDialog()"
                  >新建模板</el-button
                >
              </div>
            </div>
          </template>

          <el-scrollbar class="template-list">
            <el-empty v-if="templateList.length === 0" description="暂无模板" />
            <div v-for="template in templateList" :key="template._id" class="template-item">
              <div class="template-meta">
                <div class="template-name">{{ template.name }}</div>
                <small class="template-desc">{{ template.description || '（无描述）' }}</small>
                <div class="template-tags">
                  <el-tag size="small">
                    菜单数：{{ template.menuPermissions?.length || 0 }}
                  </el-tag>
                  <el-tag size="small" type="info">
                    更新时间：{{ formatDate(template.updatedAt) }}
                  </el-tag>
                </div>
              </div>
              <div class="template-actions">
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click="applyTemplateToCurrent(template)"
                >
                  应用到当前
                </el-button>
                <el-button
                  size="small"
                  type="success"
                  plain
                  @click="openBatchApplyDialog(template)"
                >
                  批量应用
                </el-button>
                <el-dropdown trigger="click">
                  <span class="el-dropdown-link">
                    更多
                    <el-icon><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click.native="openTemplateDialog(template)"
                        >编辑</el-dropdown-item
                      >
                      <el-dropdown-item @click.native="confirmDeleteTemplate(template)" divided>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 模板对话框 -->
    <el-dialog
      v-model="templateDialog.visible"
      :title="templateDialog.template ? '编辑模板' : '新建模板'"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form :model="templateDialog.form" label-width="90px">
        <el-form-item label="模板名称">
          <el-input v-model="templateDialog.form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="templateDialog.form.description"
            placeholder="可选描述"
            type="textarea"
            rows="2"
          />
        </el-form-item>
        <el-form-item v-if="templateDialog.template" label="更新菜单">
          <el-switch v-model="templateDialog.form.useCurrentPermissions" />
          <small class="switch-tip">开启后将使用当前勾选的菜单替换模板菜单</small>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="templateDialog.loading" @click="handleTemplateSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量应用对话框 -->
    <el-dialog
      v-model="batchDialog.visible"
      title="批量应用模板"
      width="520px"
      :close-on-click-modal="false"
    >
      <p class="batch-tip">
        模板：<strong>{{ batchDialog.template?.name }}</strong>
      </p>
      <el-transfer
        v-model="batchDialog.selectedUserIds"
        filterable
        :titles="['可选用户', '已选择']"
        :data="transferUsers"
        :props="{ key: 'value', label: 'label', disabled: 'disabled' }"
      />
      <template #footer>
        <el-button @click="batchDialog.visible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="batchDialog.loading"
          :disabled="batchDialog.selectedUserIds.length === 0"
          @click="handleBatchApply"
        >
          应用
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ArrowDown } from '@element-plus/icons-vue'
import { getUserList } from '@/api/user'
import {
  getAllMenuItems,
  getUserMenuPermissions,
  updateUserMenuPermissions,
  createMenuTemplate,
  getMenuTemplateList,
  updateMenuTemplate,
  deleteMenuTemplate,
  applyMenuTemplate
} from '@/api/menuPermission'

defineOptions({
  name: 'MenuPermissionManager'
})

const route = useRoute()

const userList = ref([])
const userLoading = ref(false)
const userKeyword = ref('')
const selectedUserId = ref('')
const selectedUserName = ref('')
const defaultPermissions = ref([])
const selectedPermissions = ref([])
const permissionMode = ref('default')
const lastSavedState = ref({ mode: 'default', permissions: [] })
const saveLoading = ref(false)

const menuItems = ref([])
const menuLoading = ref(false)

const templateList = ref([])
const templateLoading = ref(false)

const templateDialog = reactive({
  visible: false,
  loading: false,
  template: null,
  form: {
    name: '',
    description: '',
    useCurrentPermissions: true
  }
})

const batchDialog = reactive({
  visible: false,
  loading: false,
  template: null,
  selectedUserIds: []
})

const filteredUsers = computed(() => {
  if (!userKeyword.value) {
    return userList.value
  }
  const keyword = userKeyword.value.toLowerCase()
  return userList.value.filter(
    user =>
      user.username?.toLowerCase().includes(keyword) || user.email?.toLowerCase().includes(keyword)
  )
})

const menuGroups = computed(() => menuItems.value)

const isUsingDefault = computed(() => permissionMode.value === 'default')
const currentModeLabel = computed(() => {
  if (permissionMode.value === 'default') return '默认权限'
  if (permissionMode.value === 'template') return '模板权限'
  return '自定义权限'
})
const currentModeTagType = computed(() => {
  if (permissionMode.value === 'default') return 'info'
  if (permissionMode.value === 'template') return 'warning'
  return 'success'
})

const arraysEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, idx) => val === sortedB[idx])
}

const isDirty = computed(() => {
  if (permissionMode.value !== lastSavedState.value.mode) {
    return true
  }
  return !arraysEqual(selectedPermissions.value, lastSavedState.value.permissions)
})

const transferUsers = computed(() =>
  userList.value.map(user => ({
    value: user._id || user.id,
    label: `${user.username || ''} (${user.email || ''})`,
    disabled: user.role === 'super_admin'
  }))
)

const roleTagType = role => {
  switch (role) {
    case 'super_admin':
      return 'danger'
    case 'admin':
      return 'warning'
    case 'vip':
      return 'success'
    default:
      return 'info'
  }
}

const formatRole = (role, vipLevel) => {
  switch (role) {
    case 'super_admin':
      return '超级管理员'
    case 'admin':
      return '管理员'
    case 'vip':
      return `VIP${vipLevel || ''}`
    default:
      return '普通用户'
  }
}

const formatDate = value => {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

const loadUsers = async () => {
  try {
    userLoading.value = true
    const response = await getUserList({ page: 1, limit: 200 })
    if (response.code === 200 && response.data) {
      userList.value = response.data.users || response.data.list || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error(error.message || '加载用户失败')
  } finally {
    userLoading.value = false
  }
}

const loadMenuItems = async () => {
  try {
    menuLoading.value = true
    const response = await getAllMenuItems()
    if (response.code === 200 && response.data) {
      menuItems.value = response.data.menuItems || []
    }
  } catch (error) {
    console.error('加载菜单配置失败:', error)
    ElMessage.error(error.message || '加载菜单配置失败')
  } finally {
    menuLoading.value = false
  }
}

const loadTemplates = async () => {
  try {
    templateLoading.value = true
    const response = await getMenuTemplateList()
    if (response.code === 200 && response.data) {
      templateList.value = response.data.templates || []
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error(error.message || '加载模板失败')
  } finally {
    templateLoading.value = false
  }
}

const handleUserSearch = () => {
  // computed 自动过滤
}

const handleSelectUser = row => {
  if (!row || !row._id) return
  if (selectedUserId.value === row._id) return

  selectedUserId.value = row._id
  selectedUserName.value = row.username || ''
  loadUserMenuConfig(row._id)
}

const loadUserMenuConfig = async userId => {
  try {
    saveLoading.value = true
    const response = await getUserMenuPermissions(userId)
    if (response.code === 200 && response.data) {
      defaultPermissions.value = response.data.defaultPermissions || []
      selectedPermissions.value = normalizeSelection(response.data.menuPermissions || [])
      permissionMode.value = response.data.menuPermissionMode || 'default'
      lastSavedState.value = {
        mode: permissionMode.value,
        permissions: [...selectedPermissions.value]
      }
    } else {
      ElMessage.error(response.message || '获取用户菜单权限失败')
    }
  } catch (error) {
    console.error('获取用户菜单权限失败:', error)
    ElMessage.error(error.message || '获取用户菜单权限失败')
  } finally {
    saveLoading.value = false
  }
}

const getAllMenuKeys = () => {
  const keys = []
  const collect = items => {
    items.forEach(item => {
      keys.push(item.key)
      if (item.children && item.children.length > 0) {
        collect(item.children)
      }
    })
  }
  collect(menuItems.value)
  return keys
}

const normalizeSelection = selection => {
  const set = new Set(selection || [])
  menuItems.value.forEach(group => {
    if (group.children && group.children.length > 0) {
      const hasChild = group.children.some(child => set.has(child.key))
      if (hasChild) {
        set.add(group.key)
      } else {
        set.delete(group.key)
      }
    }
  })
  return Array.from(set)
}

const markCustomMode = () => {
  if (permissionMode.value !== 'custom') {
    permissionMode.value = 'custom'
  }
}

const handleSelectAll = () => {
  markCustomMode()
  selectedPermissions.value = normalizeSelection(getAllMenuKeys())
}

const handleClear = () => {
  markCustomMode()
  selectedPermissions.value = normalizeSelection([])
}

const handleRestoreDefault = () => {
  permissionMode.value = 'default'
  selectedPermissions.value = normalizeSelection(defaultPermissions.value)
}

const setGroupPermissions = (children = [], isSelect) => {
  const keys = children.map(item => item.key)
  if (isSelect) {
    markCustomMode()
    const set = new Set(selectedPermissions.value.concat(keys))
    selectedPermissions.value = normalizeSelection(Array.from(set))
  } else {
    markCustomMode()
    selectedPermissions.value = normalizeSelection(
      selectedPermissions.value.filter(key => !keys.includes(key))
    )
  }
}

const toggleSingle = (key, checked) => {
  if (checked) {
    markCustomMode()
    if (!selectedPermissions.value.includes(key)) {
      selectedPermissions.value = normalizeSelection(selectedPermissions.value.concat(key))
    }
  } else {
    markCustomMode()
    selectedPermissions.value = normalizeSelection(
      selectedPermissions.value.filter(item => item !== key)
    )
  }
}

const handleSave = async () => {
  if (!selectedUserId.value) {
    ElMessage.warning('请先选择用户')
    return
  }
  try {
    saveLoading.value = true
    const payloadMode = permissionMode.value
    const payloadPermissions = payloadMode === 'default' ? [] : selectedPermissions.value
    const response = await updateUserMenuPermissions(
      selectedUserId.value,
      payloadPermissions,
      payloadMode
    )
    if (response.code === 200) {
      lastSavedState.value = {
        mode: permissionMode.value,
        permissions: [...selectedPermissions.value]
      }
      ElMessage.success('菜单权限已保存')
      loadUserMenuConfig(selectedUserId.value)
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存菜单权限失败:', error)
    ElMessage.error(error.message || '保存菜单权限失败')
  } finally {
    saveLoading.value = false
  }
}

const openTemplateDialog = template => {
  templateDialog.visible = true
  templateDialog.template = template || null
  templateDialog.form.name = template?.name || ''
  templateDialog.form.description = template?.description || ''
  templateDialog.form.useCurrentPermissions = true
}

const handleTemplateSubmit = async () => {
  if (!templateDialog.form.name) {
    ElMessage.warning('模板名称不能为空')
    return
  }
  if (!selectedPermissions.value.length && !templateDialog.template) {
    ElMessage.warning('请先勾选菜单，再创建模板')
    return
  }

  try {
    templateDialog.loading = true
    if (templateDialog.template) {
      const payload = {
        name: templateDialog.form.name,
        description: templateDialog.form.description
      }
      if (templateDialog.form.useCurrentPermissions && selectedPermissions.value.length > 0) {
        payload.menuPermissions = selectedPermissions.value
      }
      const response = await updateMenuTemplate(templateDialog.template._id, payload)
      if (response.code === 200) {
        ElMessage.success('模板更新成功')
        templateDialog.visible = false
        loadTemplates()
      } else {
        ElMessage.error(response.message || '更新模板失败')
      }
    } else {
      const response = await createMenuTemplate({
        name: templateDialog.form.name,
        description: templateDialog.form.description,
        menuPermissions: selectedPermissions.value
      })
      if (response.code === 200) {
        ElMessage.success('模板创建成功')
        templateDialog.visible = false
        loadTemplates()
      } else {
        ElMessage.error(response.message || '创建模板失败')
      }
    }
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error(error.message || '保存模板失败')
  } finally {
    templateDialog.loading = false
  }
}

const confirmDeleteTemplate = template => {
  ElMessageBox.confirm(`确定删除模板「${template.name}」吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const response = await deleteMenuTemplate(template._id)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        loadTemplates()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    })
    .catch(() => {})
}

const applyTemplateToCurrent = async template => {
  if (!selectedUserId.value) {
    ElMessage.warning('请先选择用户')
    return
  }

  try {
    saveLoading.value = true
    const response = await updateUserMenuPermissions(
      selectedUserId.value,
      template.menuPermissions,
      'template'
    )
    if (response.code === 200) {
      ElMessage.success('模板已应用到当前用户')
      loadUserMenuConfig(selectedUserId.value)
    } else {
      ElMessage.error(response.message || '应用模板失败')
    }
  } catch (error) {
    console.error('应用模板失败:', error)
    ElMessage.error(error.message || '应用模板失败')
  } finally {
    saveLoading.value = false
  }
}

const openBatchApplyDialog = template => {
  batchDialog.visible = true
  batchDialog.template = template
  batchDialog.selectedUserIds = []
}

const handleBatchApply = async () => {
  try {
    batchDialog.loading = true
    const response = await applyMenuTemplate(batchDialog.template._id, batchDialog.selectedUserIds)
    if (response.code === 200) {
      ElMessage.success(`模板已应用，影响用户 ${response.data?.affected || 0} 个`)
      batchDialog.visible = false
      loadUsers()
    } else {
      ElMessage.error(response.message || '批量应用失败')
    }
  } catch (error) {
    console.error('批量应用模板失败:', error)
    ElMessage.error(error.message || '批量应用模板失败')
  } finally {
    batchDialog.loading = false
  }
}

onMounted(async () => {
  await Promise.all([loadUsers(), loadMenuItems(), loadTemplates()])
  const defaultUserId = route.query.userId
  if (defaultUserId) {
    const user = userList.value.find(
      item => item._id === defaultUserId || item.id === defaultUserId
    )
    if (user) {
      handleSelectUser(user)
    }
  }
})

watch(
  () => route.query.userId,
  userId => {
    if (userId) {
      const user = userList.value.find(item => item._id === userId || item.id === userId)
      if (user) {
        handleSelectUser(user)
      }
    }
  }
)

watch(
  selectedPermissions,
  newVal => {
    const normalized = normalizeSelection(newVal)
    if (!arraysEqual(normalized, newVal)) {
      selectedPermissions.value = normalized
      return
    }
    if (permissionMode.value !== 'custom') {
      const baseline =
        permissionMode.value === 'default'
          ? defaultPermissions.value
          : lastSavedState.value.permissions
      if (!arraysEqual(normalized, baseline)) {
        permissionMode.value = 'custom'
      }
    }
  },
  { deep: true }
)

watch(
  menuItems,
  () => {
    selectedPermissions.value = normalizeSelection(selectedPermissions.value)
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.menu-permission-page {
  .panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }
  }

  .user-table {
    margin-top: 12px;
    height: fit-content;
    overflow: auto;
    max-height: calc(100vh - 220px);
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .menu-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .menu-group {
    padding: 12px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .group-title {
        display: flex;
        flex-direction: column;
        font-weight: 600;

        small {
          font-size: 12px;
          font-weight: normal;
          color: var(--el-text-color-secondary);
        }
      }

      .group-tools {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .group-body {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 20px;

      &.single {
        padding-left: 6px;
      }

      .el-checkbox {
        min-width: 180px;

        small {
          margin-left: 4px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .template-list {
    max-height: calc(100vh - 220px);
  }

  .template-item {
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;

    .template-meta {
      margin-bottom: 12px;

      .template-name {
        font-weight: 600;
      }

      .template-desc {
        color: var(--el-text-color-secondary);
      }

      .template-tags {
        margin-top: 6px;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
    }

    .template-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .batch-tip {
    margin-bottom: 12px;
  }

  .switch-tip {
    color: var(--el-text-color-secondary);
    margin-left: 8px;
  }
}
</style>
