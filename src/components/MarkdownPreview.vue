<template>
  <div ref="containerRef" class="markdown-preview-container">
    <div v-if="loading" class="loading-wrapper">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-else-if="error" class="error-wrapper">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
    </div>
    <div v-else ref="markdownRef" class="markdown-content" v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Loading, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  // Markdown 文件 URL
  src: {
    type: String,
    required: true
  },
  // 自定义高度
  height: {
    type: String,
    default: 'auto'
  },
  // 最大高度（超出后显示滚动条）
  maxHeight: {
    type: String,
    default: 'none'
  }
})

const containerRef = ref(null)
const markdownRef = ref(null)
const markdownContent = ref('')
const loading = ref(false)
const error = ref('')

// 配置 marked（marked 4.x+ 版本）
marked.setOptions({
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 支持 GitHub Flavored Markdown
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('Highlight error:', err)
        return hljs.highlightAuto(code).value
      }
    }
    return hljs.highlightAuto(code).value
  }
})

// 渲染 Markdown
const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return ''
  try {
    return marked.parse(markdownContent.value)
  } catch (err) {
    console.error('Markdown parse error:', err)
    return `<pre>${err.message}</pre>`
  }
})

// 加载 Markdown 文件
const loadMarkdown = async () => {
  if (!props.src) {
    error.value = '未提供 Markdown 文件地址'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await fetch(props.src)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const text = await response.text()
    markdownContent.value = text
  } catch (err) {
    console.error('Failed to load markdown:', err)
    error.value = err.message || '加载 Markdown 文件失败'
  } finally {
    loading.value = false
  }
}

// 监听 src 变化
watch(
  () => props.src,
  () => {
    loadMarkdown()
  },
  { immediate: true }
)

// 组件挂载时加载
onMounted(() => {
  loadMarkdown()
})

// 暴露方法
defineExpose({
  reload: loadMarkdown,
  content: markdownContent
})
</script>

<style lang="scss" scoped>
.markdown-preview-container {
  width: 100%;
  height: v-bind(height);
  max-height: v-bind(maxHeight);
  overflow-y: auto;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  margin-bottom: var(--gutter-width, 24px);

  .loading-wrapper,
  .error-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px;
    color: var(--el-text-color-secondary);
    font-size: 14px;

    .el-icon {
      font-size: 20px;
    }
  }

  .error-wrapper {
    color: var(--el-color-error);
  }

  .markdown-content {
    width: 100%;
    color: var(--el-text-color-primary);
    line-height: 1.6;
    font-size: 16px;

    // 标题样式
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--el-text-color-primary);
    }

    :deep(h1) {
      font-size: 2em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }

    :deep(h2) {
      font-size: 1.5em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }

    :deep(h3) {
      font-size: 1.25em;
    }

    :deep(h4) {
      font-size: 1em;
    }

    :deep(h5) {
      font-size: 0.875em;
    }

    :deep(h6) {
      font-size: 0.85em;
      color: var(--el-text-color-secondary);
    }

    // 段落样式
    :deep(p) {
      margin: 0 0 16px 0;
    }

    // 列表样式
    :deep(ul),
    :deep(ol) {
      margin: 0 0 16px 0;
      padding-left: 30px;
    }

    :deep(li) {
      margin: 4px 0;
    }

    :deep(ul) {
      list-style-type: disc;
    }

    :deep(ol) {
      list-style-type: decimal;
    }

    // 链接样式
    :deep(a) {
      color: var(--el-color-primary);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: var(--el-color-primary-light-3);
        text-decoration: underline;
      }
    }

    // 代码块样式
    :deep(pre) {
      background-color: #0d1117;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);

      code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
        font-size: 14px;
        line-height: 1.5;
        color: #c9d1d9;
      }
    }

    // 行内代码样式
    :deep(code) {
      background-color: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
      color: #e06c75;
    }

    // 引用样式
    :deep(blockquote) {
      border-left: 4px solid var(--el-color-primary);
      padding-left: 16px;
      margin: 16px 0;
      color: var(--el-text-color-secondary);
      font-style: italic;
      background-color: rgba(255, 255, 255, 0.03);
      padding: 12px 16px;
      border-radius: 4px;
    }

    // 表格样式
    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    :deep(th),
    :deep(td) {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    :deep(th) {
      background-color: rgba(255, 255, 255, 0.05);
      font-weight: 600;
    }

    :deep(tr:last-child td) {
      border-bottom: none;
    }

    // 水平线样式
    :deep(hr) {
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 24px 0;
    }

    // 图片样式
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    // 强调样式
    :deep(strong) {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    :deep(em) {
      font-style: italic;
    }

    // 删除线样式
    :deep(del) {
      text-decoration: line-through;
      opacity: 0.7;
    }
  }
}

// 滚动条样式
.markdown-preview-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.markdown-preview-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.markdown-preview-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
