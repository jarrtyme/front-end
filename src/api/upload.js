// 文件上传和管理相关 API
import { post, upload } from '@/utils/request'

/**
 * 获取文件列表（所有文件类型，需要鉴权）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10，最大100）
 * @param {string} params.fileType - 文件类型筛选（可选：'image', 'video', 'document', 'archive', 'text', 'other'）
 * @param {string} params.description - 描述搜索关键字（支持 | 分隔的多个关键词，如：'关键词1|关键词2'）
 * @returns {Promise}
 */
export function getFileList(params = {}) {
  return post('/upload/list', params)
}

/**
 * 删除文件（单个）
 * @param {string} filename - 文件名（可选，如果提供filePath则不需要）
 * @param {string} filePath - 文件路径（包含分类目录，如 /uploads/images/xxx.jpg，优先使用）
 * @returns {Promise}
 */
export function deleteFile(filename = null, filePath = null) {
  return post('/upload/delete', { filename, filePath })
}

/**
 * 批量删除文件
 * @param {Array} files - 文件数组，每个元素包含 { filename, filePath }
 * @returns {Promise}
 */
export function deleteFiles(files) {
  return post('/upload/delete', { files })
}

/**
 * 统一上传接口
 * 支持多文件上传，支持所有文件类型，自动按文件类型分类存储
 * @param {FileList|File[]|File} files - 要上传的文件（单个或多个）
 * @returns {Promise}
 */
export function uploadFiles(files) {
  const formData = new FormData()

  // 将文件添加到 FormData（统一使用 files 字段名）
  if (files instanceof FileList) {
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })
  } else if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('files', file)
    })
  } else {
    // 单个文件也使用 files 字段名，后端会自动处理
    formData.append('files', files)
  }

  // 使用统一的 upload 方法
  return upload('/upload', formData)
}
