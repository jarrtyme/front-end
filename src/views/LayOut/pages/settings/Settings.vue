<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>

      <el-tabs v-model="activeTab" tab-position="left" style="min-height: 400px">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicSettings" label-width="150px" style="max-width: 600px">
            <el-form-item label="网站名称">
              <el-input v-model="basicSettings.siteName" placeholder="请输入网站名称" />
            </el-form-item>
            <el-form-item label="网站描述">
              <el-input
                v-model="basicSettings.siteDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入网站描述"
              />
            </el-form-item>
            <el-form-item label="网站Logo">
              <FileUpload
                file-type="image"
                :max-size="50"
                :max-count="1"
                :multiple="false"
                :drag="false"
                list-type="avatar"
                :avatar-url="basicSettings.logo"
                :show-file-list="false"
                @success="handleLogoSuccess"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
              <el-button @click="resetBasicSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securitySettings" label-width="150px" style="max-width: 600px">
            <el-form-item label="允许注册">
              <el-switch v-model="securitySettings.allowRegister" />
            </el-form-item>
            <el-form-item label="需要邮箱验证">
              <el-switch v-model="securitySettings.requireEmailVerify" />
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
            </el-form-item>
            <el-form-item label="会话超时时间（分钟）">
              <el-input-number v-model="securitySettings.sessionTimeout" :min="5" :max="1440" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
              <el-button @click="resetSecuritySettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notification">
          <el-form :model="notificationSettings" label-width="150px" style="max-width: 600px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailNotification" />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.smsNotification" />
            </el-form-item>
            <el-form-item label="系统通知">
              <el-switch v-model="notificationSettings.systemNotification" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              <el-button @click="resetNotificationSettings">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="关于系统" name="about">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="系统名称">后台管理系统</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="开发框架">Vue 3 + Element Plus</el-descriptions-item>
            <el-descriptions-item label="构建工具">Vite</el-descriptions-item>
            <el-descriptions-item label="更新时间">2024-01-15</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import FileUpload from '@/views/home/components/FileUpload.vue'

defineOptions({
  name: 'Settings'
})

const activeTab = ref('basic')

// 基本设置
const basicSettings = reactive({
  siteName: '后台管理系统',
  siteDescription: '这是一个功能完善的后台管理系统',
  logo: ''
})

// 安全设置
const securitySettings = reactive({
  allowRegister: true,
  requireEmailVerify: false,
  minPasswordLength: 6,
  sessionTimeout: 30
})

// 通知设置
const notificationSettings = reactive({
  emailNotification: true,
  smsNotification: false,
  systemNotification: true
})

const handleLogoSuccess = (response, file) => {
  if (response.code === 200) {
    const fileData = response.data.files ? response.data.files[0] : response.data
    if (fileData) {
      basicSettings.logo = fileData.url || fileData.path
      ElMessage.success('Logo上传成功')
    }
  }
}

const saveBasicSettings = () => {
  ElMessage.success('基本设置已保存')
  // TODO: 保存到后端
}

const resetBasicSettings = () => {
  basicSettings.siteName = '后台管理系统'
  basicSettings.siteDescription = '这是一个功能完善的后台管理系统'
  basicSettings.logo = ''
  ElMessage.info('已重置为默认值')
}

const saveSecuritySettings = () => {
  ElMessage.success('安全设置已保存')
  // TODO: 保存到后端
}

const resetSecuritySettings = () => {
  securitySettings.allowRegister = true
  securitySettings.requireEmailVerify = false
  securitySettings.minPasswordLength = 6
  securitySettings.sessionTimeout = 30
  ElMessage.info('已重置为默认值')
}

const saveNotificationSettings = () => {
  ElMessage.success('通知设置已保存')
  // TODO: 保存到后端
}

const resetNotificationSettings = () => {
  notificationSettings.emailNotification = true
  notificationSettings.smsNotification = false
  notificationSettings.systemNotification = true
  ElMessage.info('已重置为默认值')
}
</script>

<style lang="scss" scoped>
.settings-page {
  .card-header {
    font-weight: 600;
    font-size: 16px;
  }

  .avatar-uploader {
    :deep(.avatar) {
      width: 100px;
      height: 100px;
      display: block;
    }

    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    :deep(.avatar-uploader-icon) {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
    }
  }
}
</style>
