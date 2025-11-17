<template>
  <el-dialog
    v-model="dialogVisible"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="false"
    :before-close="handleBeforeClose"
    class="modern-dialog"
    draggable
    @close="handleClose"
  >
    <!-- 标题区域 -->
    <template #header>
      <div class="modern-dialog-header">
        <div v-if="subtitle || title" class="header-content">
          <div v-if="subtitle" class="header-subtitle">{{ subtitle }}</div>
          <div v-if="title" class="header-title">{{ title }}</div>
        </div>
        <button class="close-button" @click="handleClose">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </template>

    <!-- 内容区域 -->
    <div class="modern-dialog-body">
      <!-- 主内容区域（带圆角卡片样式） -->
      <div v-if="$slots.default" class="content-card">
        <slot></slot>
      </div>

      <!-- 底部图片展示区域 -->
      <div v-if="images && images.length > 0" class="images-section">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
          @click="handleImageClick(image, index)"
        >
          <el-image
            :src="image.url || image"
            fit="cover"
            class="image"
            :preview-src-list="imageList"
          >
            <template #error>
              <div class="image-error">加载失败</div>
            </template>
          </el-image>
        </div>
      </div>
    </div>

    <!-- Footer 插槽 -->
    <template #footer>
      <div v-if="$slots.footer" class="footer-slot">
        <slot name="footer"></slot>
      </div>
      <div v-else class="footer-default">
        <el-button type="primary" :loading="confirmLoading" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 控制显示/隐藏
  modelValue: {
    type: Boolean,
    default: false
  },
  // 对话框宽度
  width: {
    type: [String, Number],
    default: '600px'
  },
  // 主标题
  title: {
    type: String,
    default: ''
  },
  // 副标题（小灰色文字）
  subtitle: {
    type: String,
    default: ''
  },
  // 底部图片列表
  images: {
    type: Array,
    default: () => []
  },
  // 是否点击遮罩层关闭
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  // 是否按 ESC 关闭
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  // 关闭前的回调
  beforeClose: {
    type: Function,
    default: null
  },
  // 确认按钮文本
  confirmText: {
    type: String,
    default: '确认'
  },
  // 确认按钮loading状态
  confirmLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'image-click', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 图片列表（用于预览）
const imageList = computed(() => {
  if (!props.images || props.images.length === 0) return []
  return props.images.map(img => (typeof img === 'string' ? img : img.url || img))
})

// 处理关闭
const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

// 处理关闭前回调
const handleBeforeClose = done => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}

// 处理图片点击
const handleImageClick = (image, index) => {
  emit('image-click', image, index)
}

// 处理确认按钮点击
const handleConfirm = () => {
  emit('confirm')
}
</script>
<style>
.el-overlay-dialog {
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.35),
    0 10px 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.08) !important;

  backdrop-filter: blur(20px);
}
</style>
<style lang="scss" scoped>
:deep(.modern-dialog) {
  .el-dialog {
    border-radius: 24px;
    overflow: hidden;

    .el-dialog__header {
      padding: 0;
      margin: 0;
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      padding: 20px 32px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      // 确认按钮样式（与关闭按钮一致）
      .el-button--primary {
        background-color: #1d1d1f;
        border-color: #1d1d1f;
        color: #fff;
        border-radius: 20px;
        padding: 8px 20px;
        font-weight: 500;
        transition: all 0.2s ease;

        &:hover {
          background-color: #424245;
          border-color: #424245;
          transform: scale(1.02);
        }

        &:active {
          transform: scale(0.98);
        }

        &.is-loading {
          background-color: #1d1d1f;
          border-color: #1d1d1f;
        }
      }

      // 取消按钮样式
      .el-button:not(.el-button--primary) {
        background-color: transparent;
        border-color: #d2d2d7;
        color: #1d1d1f;
        border-radius: 20px;
        padding: 8px 20px;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f5f5f7;
          border-color: #86868b;
        }
      }
    }
  }

  .footer-default {
    display: flex;
    justify-content: flex-end;
  }

  // 遮罩层阴影效果
  .el-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
  }
}

.modern-dialog-header {
  position: relative;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    flex: 1;

    .header-subtitle {
      font-size: 14px;
      color: #86868b;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .header-title {
      font-size: 22px;
      font-weight: 600;
      color: #1d1d1f;
      line-height: 1.2;
    }
  }

  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 37px;
    height: 37px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light, #101010);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    color: var(--el-text-color-regular, #27282b);
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: var(--el-fill-color, #f0f2f5);
      color: var(--el-text-color-primary, #303133);
      transform: scale(1.08);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 27px;
      height: 27px;
    }
  }
}

.modern-dialog-body {
  padding: 0 32px 32px;

  .content-card {
    background-color: #fff;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #f0f0f0;
  }

  .images-section {
    display: flex;
    gap: 16px;
    margin-top: 24px;

    .image-item {
      flex: 1;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.02);
      }

      .image {
        width: 100%;
        height: 200px;
        border-radius: 12px;
        overflow: hidden;

        :deep(.el-image__inner) {
          object-fit: cover;
        }
      }

      .image-error {
        width: 100%;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f5f5f5;
        color: #999;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .modern-dialog-header {
    padding: 10px;

    .header-content {
      .header-title {
        font-size: 16px;
      }
    }

    .close-button {
      top: 10px;
      right: 10px;
      width: 28px;
      height: 28px;

      svg {
        width: 14px;
        height: 14px;
      }
    }
  }

  .modern-dialog-body {
    padding: 0 20px 20px;

    .content-card {
      padding: 20px;
      border-radius: 12px;
    }

    .images-section {
      flex-direction: column;
      gap: 12px;

      .image-item {
        .image {
          height: 150px;
        }
      }
    }
  }
}
</style>
