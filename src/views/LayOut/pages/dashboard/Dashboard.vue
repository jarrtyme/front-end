<template>
  <div class="dashboard-page">
    <el-card class="page-header">
      <h2>仪表盘</h2>
      <p>欢迎来到后台管理系统</p>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(stats.userCount) }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon clothing-icon">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(stats.clothingCount) }}</div>
              <div class="stat-label">服装数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon upload-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(stats.uploadCount) }}</div>
              <div class="stat-label">已上传文件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon order-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(stats.orderCount) }}</div>
              <div class="stat-label">订单数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="2024-01-15 10:30" placement="top">
              <el-card>
                <h4>新用户注册</h4>
                <p>用户 "张三" 注册了账号</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2024-01-15 09:20" placement="top">
              <el-card>
                <h4>服装更新</h4>
                <p>更新了 5 件服装信息</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2024-01-15 08:15" placement="top">
              <el-card>
                <h4>文件上传</h4>
                <p>上传了 3 个新文件</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goToUsers">
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
            <el-button type="success" @click="goToClothing">
              <el-icon><Box /></el-icon>
              服装管理
            </el-button>
            <el-button type="warning" @click="goToUpload">
              <el-icon><Upload /></el-icon>
              文件上传
            </el-button>
            <el-button type="danger" @click="goToMedia">
              <el-icon><Picture /></el-icon>
              媒体库管理
            </el-button>
            <el-button type="info" @click="goToSettings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Box, Upload, ShoppingCart, Setting, Picture } from '@element-plus/icons-vue'
import { getUserList } from '@/api/user'
import { findClothing, getClothingStats } from '@/api/clothing'
import { getFileList } from '@/api/upload'

defineOptions({
  name: 'Dashboard'
})

const router = useRouter()

// 统计数据
const stats = ref({
  userCount: 0,
  clothingCount: 0,
  uploadCount: 0,
  orderCount: 0
})

const loading = ref(false)

// 加载统计数据
const loadStats = async () => {
  loading.value = true
  try {
    // 并行请求所有统计数据
    const [userRes, clothingRes, imageRes, statsRes] = await Promise.allSettled([
      getUserList({ page: 1, limit: 1 }),
      findClothing({ page: 1, limit: 1 }),
      getFileList(),
      getClothingStats()
    ])

    // 用户总数
    if (userRes.status === 'fulfilled' && userRes.value.code === 200) {
      stats.value.userCount = userRes.value.data?.total || userRes.value.data?.count || 0
    }

    // 服装数量
    if (clothingRes.status === 'fulfilled' && clothingRes.value.code === 200) {
      stats.value.clothingCount =
        clothingRes.value.data?.total || clothingRes.value.data?.count || 0
    }

    // 上传文件数量
    if (imageRes.status === 'fulfilled' && imageRes.value.code === 200) {
      stats.value.uploadCount =
        imageRes.value.data?.count || imageRes.value.data?.images?.length || 0
    }

    // 订单数量（暂时使用服装统计）
    if (statsRes.status === 'fulfilled' && statsRes.value.code === 200) {
      stats.value.orderCount = statsRes.value.data?.totalItems || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化数字
const formatNumber = num => {
  return num.toLocaleString('zh-CN')
}

// 初始化加载
onMounted(() => {
  loadStats()
})

const goToUsers = () => {
  router.push('/admin/users')
}

const goToClothing = () => {
  router.push('/admin/clothing')
}

const goToUpload = () => {
  router.push('/admin/upload')
}

const goToMedia = () => {
  router.push('/admin/upload')
}

const goToSettings = () => {
  router.push('/admin/settings')
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 22px;

  .page-header {
    margin-bottom: 60px;
    text-align: center;

    h2 {
      margin: 0 0 12px 0;
      font-size: 48px;
      font-weight: 600;
      color: #1d1d1f;
      letter-spacing: -0.5px;
    }

    p {
      margin: 0;
      color: #86868b;
      font-size: 21px;
      font-weight: 400;
    }
  }

  .stats-row {
    margin-bottom: 60px;

    .stat-card {
      background: transparent;
      border: none;
      box-shadow: none;

      :deep(.el-card__body) {
        padding: 0;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 30px 20px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: saturate(180%) blur(20px);
        border-radius: 18px;
        border: 0.5px solid rgba(0, 0, 0, 0.1);
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: #fff;
          margin-bottom: 16px;

          &.user-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.clothing-icon {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.upload-icon {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.order-icon {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 40px;
            font-weight: 600;
            color: #1d1d1f;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .stat-label {
            font-size: 17px;
            color: #86868b;
            font-weight: 400;
          }
        }
      }
    }
  }

  .content-row {
    .el-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: saturate(180%) blur(20px);
      border: 0.5px solid rgba(0, 0, 0, 0.1);
      border-radius: 18px;
      box-shadow: none;

      :deep(.el-card__header) {
        border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
        padding: 20px 24px;
      }

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .card-header {
      font-weight: 600;
      font-size: 24px;
      color: #1d1d1f;
      letter-spacing: -0.3px;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .el-button {
        flex: 1;
        min-width: 140px;
        height: 44px;
        border-radius: 12px;
        font-size: 17px;
        font-weight: 400;
        border: 0.5px solid rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
