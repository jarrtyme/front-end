/**
 * 上传响应处理工具函数
 * 统一处理单文件和多文件上传的响应格式，避免重复代码和错误
 */

/**
 * 从上传响应中提取文件信息数组
 * 统一处理单文件和多文件两种返回格式
 *
 * @param {Object} response - 上传接口响应对象
 * @param {number} response.code - 响应状态码
 * @param {Object|Array} response.data - 响应数据（单文件是对象，多文件是 { files: [] }）
 * @returns {Array} 文件信息数组，每个元素包含 { url, path, ... }
 *
 * @example
 * // 单文件响应
 * const response1 = { code: 200, data: { url: '...', path: '...' } }
 * extractFiles(response1) // [{ url: '...', path: '...' }]
 *
 * // 多文件响应
 * const response2 = { code: 200, data: { files: [{ url: '...' }, { url: '...' }] } }
 * extractFiles(response2) // [{ url: '...' }, { url: '...' }]
 */
export function extractFiles(response) {
  if (!response || typeof response !== 'object') {
    return []
  }

  if (response.code !== 200) {
    return []
  }

  if (!response.data) {
    return []
  }

  const { data } = response

  if (data.files && Array.isArray(data.files)) {
    return data.files.filter(file => file != null)
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return [data]
  }

  if (Array.isArray(data)) {
    return data.filter(file => file != null)
  }

  return []
}

/**
 * 从文件信息中提取图片URL
 * 优先使用 url 字段（完整URL），如果没有则使用 path
 *
 * @param {Object} fileInfo - 文件信息对象
 * @param {string} [fileInfo.url] - 完整URL
 * @param {string} [fileInfo.path] - 文件路径
 * @returns {string|null} 图片URL，如果无效则返回null
 */
export function extractImageUrl(fileInfo) {
  if (!fileInfo || typeof fileInfo !== 'object') {
    return null
  }

  const url = (fileInfo.url && fileInfo.url.trim()) || (fileInfo.path && fileInfo.path.trim())

  if (!url || typeof url !== 'string') {
    return null
  }

  return url
}

/**
 * 从上传响应中提取所有图片URL
 *
 * @param {Object} response - 上传接口响应对象
 * @returns {Array<string>} 图片URL数组
 */
export function extractImageUrls(response) {
  const files = extractFiles(response)
  return files.map(extractImageUrl).filter(url => url != null)
}

/**
 * 从文件对象中提取上传响应中的图片URL
 * 用于处理 Element Plus Upload 组件的 file 对象
 *
 * @param {Object} file - Element Plus Upload 的 file 对象
 * @param {Object} [file.response] - 上传响应对象
 * @param {number} [fileIndex] - 文件在列表中的索引（用于多文件上传）
 * @returns {string|null} 图片URL，如果无效则返回null
 */
export function extractImageUrlFromFile(file, fileIndex = null) {
  if (!file || !file.response) {
    return null
  }

  const { response } = file

  // 处理多文件上传的情况
  if (response.data?.files && Array.isArray(response.data.files)) {
    // 如果提供了索引，使用对应索引的文件
    if (fileIndex != null && fileIndex >= 0 && fileIndex < response.data.files.length) {
      return extractImageUrl(response.data.files[fileIndex])
    }
    // 否则尝试使用第一个文件（fallback）
    if (response.data.files.length > 0) {
      return extractImageUrl(response.data.files[0])
    }
  }

  // 处理单文件上传的情况
  if (response.data && typeof response.data === 'object') {
    return extractImageUrl(response.data)
  }

  return null
}

/**
 * 验证上传响应是否有效
 *
 * @param {Object} response - 上传接口响应对象
 * @returns {boolean} 是否为有效响应
 */
export function isValidUploadResponse(response) {
  return response && typeof response === 'object' && response.code === 200 && response.data != null
}
