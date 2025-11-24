<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" tab-position="left" style="min-height: 400px">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="info">
          <el-form
            ref="infoFormRef"
            :model="userInfo"
            :rules="infoRules"
            label-width="120px"
            style="max-width: 600px"
          >
            <el-form-item label="头像">
              <div class="avatar-upload-container">
                <div class="avatar-uploader" @click="triggerFileInput">
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    :disabled="infoLoading"
                    @change="handleFileChange"
                  />
                  <div class="avatar-trigger">
                    <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
                    <div v-else class="avatar-placeholder">
                      <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
                    </div>
                  </div>
                </div>
                <div class="avatar-tip">点击上传头像，支持裁剪和旋转</div>
              </div>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="userInfo.username"
                placeholder="请输入用户名"
                :disabled="infoLoading"
              />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="userInfo.email"
                type="email"
                placeholder="请输入邮箱"
                :disabled="infoLoading"
              />
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="userInfo.role" disabled />
            </el-form-item>
            <el-form-item label="注册时间">
              <el-input :value="formatDate(userInfo.createdAt)" disabled />
            </el-form-item>
            <el-form-item label="最后登录">
              <el-input :value="formatDate(userInfo.lastLogin)" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="infoLoading" @click="handleUpdateInfo">
                保存修改
              </el-button>
              <el-button :disabled="infoLoading" @click="handleResetInfo">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            style="max-width: 600px"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
                :disabled="passwordLoading"
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码（至少6个字符）"
                show-password
                :disabled="passwordLoading"
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                :disabled="passwordLoading"
                @keyup.enter="handleChangePassword"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">
                修改密码
              </el-button>
              <el-button :disabled="passwordLoading" @click="handleResetPassword">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 头像裁剪对话框 -->
    <AvatarCropper
      v-model="cropperVisible"
      :image-src="cropperImageSrc"
      @crop="handleAvatarCrop"
      @close="handleCropperClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUserInfo, updateUserInfo, changePassword } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import AvatarCropper from '@/components/AvatarCropper.vue'
import { uploadFiles } from '@/api/upload'
import { getRoleLabel, isSuperAdmin, ROLES } from '@/config/role'

defineOptions({
  name: 'Profile'
})

const userStore = useUserStore()

const activeTab = ref('info')
const infoFormRef = ref(null)
const passwordFormRef = ref(null)
const infoLoading = ref(false)
const passwordLoading = ref(false)
const fileInputRef = ref(null)
const cropperVisible = ref(false)
const cropperImageSrc = ref('')
const selectedFile = ref(null)

// 用户信息表单
const userInfo = reactive({
  avatar: '',
  username: '',
  email: '',
  role: '',
  createdAt: '',
  lastLogin: ''
})

// 原始用户信息（用于重置）
const originalUserInfo = ref({})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const infoRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = date => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    infoLoading.value = true
    const response = await getUserInfo()
    if (response.code === 200 && response.data) {
      const user = response.data.user || response.data
      const userData = {
        avatar: user.avatar || '',
        username: user.username || '',
        email: user.email || '',
        role: getRoleLabel(user.role, user.vipLevel),
        createdAt: user.createdAt || '',
        lastLogin: user.lastLogin || ''
      }
      Object.assign(userInfo, userData)
      // 保存原始信息用于重置（深拷贝）
      originalUserInfo.value = JSON.parse(JSON.stringify(userData))
    } else {
      ElMessage.error(response.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  } finally {
    infoLoading.value = false
  }
}

// 更新用户信息
const handleUpdateInfo = async () => {
  if (!infoFormRef.value) return

  try {
    await infoFormRef.value.validate()
    infoLoading.value = true

    const updateData = {
      username: userInfo.username,
      email: userInfo.email,
      avatar: userInfo.avatar
    }

    const response = await updateUserInfo(updateData)
    if (response.code === 200) {
      ElMessage.success('用户信息更新成功')
      // 更新 store 中的用户信息
      if (response.data && response.data.user) {
        userStore.setUserInfo(response.data.user, userStore.rememberMe)
      }
      // 重新加载用户信息
      await loadUserInfo()
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('更新用户信息失败:', error)
      ElMessage.error(error.message || '更新失败')
    }
  } finally {
    infoLoading.value = false
  }
}

// 重置用户信息表单
const handleResetInfo = () => {
  if (originalUserInfo.value && originalUserInfo.value.username) {
    Object.assign(userInfo, JSON.parse(JSON.stringify(originalUserInfo.value)))
    infoFormRef.value?.clearValidate()
    ElMessage.info('已重置为原始信息')
  } else {
    // 如果没有原始信息，重新加载
    loadUserInfo()
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    const response = await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      // 清空表单
      handleResetPassword()
      // 延迟跳转到登录页
      setTimeout(() => {
        userStore.logout()
        window.location.href = '/login'
      }, 1500)
    } else {
      ElMessage.error(response.message || '修改密码失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('修改密码失败:', error)
      ElMessage.error(error.message || '修改密码失败')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const handleResetPassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 触发文件选择
const triggerFileInput = () => {
  if (infoLoading.value) return
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileChange = event => {
  const file = event.target.files?.[0]
  if (!file) return

  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    // 清空 input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  // 验证文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    // 清空 input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  // 保存文件并打开裁剪对话框
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = e => {
    cropperImageSrc.value = e.target.result
    cropperVisible.value = true
  }
  reader.onerror = () => {
    ElMessage.error('读取文件失败')
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
  reader.readAsDataURL(file)
}

// 处理头像裁剪完成
const handleAvatarCrop = async cropData => {
  try {
    infoLoading.value = true

    // 上传裁剪后的图片
    const response = await uploadFiles([cropData.file])

    if (response && response.code === 200) {
      const fileData = response.data.files ? response.data.files[0] : response.data
      if (fileData) {
        userInfo.avatar = fileData.url || fileData.path
        ElMessage.success('头像上传成功')
        // 自动保存头像
        await handleUpdateInfo()
      }
    } else {
      ElMessage.error(response?.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败')
  } finally {
    infoLoading.value = false
    // 清理预览 URL
    if (cropData.previewUrl) {
      URL.revokeObjectURL(cropData.previewUrl)
    }
  }
}

// 关闭裁剪对话框
const handleCropperClose = () => {
  // 清理预览 URL
  if (cropperImageSrc.value && cropperImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropperImageSrc.value)
  }
  cropperVisible.value = false
  cropperImageSrc.value = ''
  selectedFile.value = null
  // 清空文件输入
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 初始化加载
onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-page {
  .card-header {
    font-weight: 600;
    font-size: 16px;
  }

  .avatar-upload-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;

    .avatar-uploader {
      position: relative;
      display: inline-block;
      cursor: pointer;

      .avatar-trigger {
        width: 100px;
        height: 100px;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--el-fill-color-lighter);

        &:hover {
          border-color: var(--el-color-primary);
          background-color: var(--el-fill-color-light);
        }
      }

      .avatar {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
      }
    }

    .avatar-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 4px;
    }
  }
}
</style>
