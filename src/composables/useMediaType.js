/**
 * 媒体类型判断工具
 * 用于判断媒体项是图片还是视频
 *
 * 后端已保证 item.media.type 只能是 'image' 或 'video'
 */

/**
 * 判断媒体项是否为图片
 * @param {Object|String|Number} item - 媒体项
 * @returns {Boolean} 是否为图片
 */
export function isImage(item) {
  // 处理数字或字符串（默认作为图片，兼容旧数据）
  if (!item || typeof item === 'number' || typeof item === 'string') {
    return true
  }

  // 优先检查后端保证的 media.type（这是最可靠的）
  const mediaType = item.media?.type || item.type || item.fileType

  if (mediaType === 'image') {
    return true
  }

  if (mediaType === 'video') {
    return false
  }

  // 如果没有 type 字段（边缘情况），默认作为图片
  return true
}

/**
 * 判断媒体项是否为视频
 * @param {Object|String|Number} item - 媒体项
 * @returns {Boolean} 是否为视频
 */
export function isVideo(item) {
  return !isImage(item)
}

/**
 * 媒体类型判断 Composable
 * @returns {Object} 包含 isImage 和 isVideo 函数的对象
 */
export function useMediaType() {
  return {
    isImage,
    isVideo
  }
}
