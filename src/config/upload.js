/**
 * 文件上传配置
 * 统一管理文件上传相关的默认配置
 */

// 默认文件大小限制（MB）
export const MAX_FILE_SIZE = {
  STANDARD: 100, // 标准上传默认大小
  SETTINGS: 50, // 设置页面默认大小
  CLOTHING: 100 // 服装管理默认大小
}

/**
 * 获取默认文件大小限制
 * @param {string} type - 类型：'standard' | 'settings' | 'clothing'
 * @returns {number} 文件大小限制（MB）
 */
export function getMaxFileSize(type = 'standard') {
  const typeMap = {
    standard: MAX_FILE_SIZE.STANDARD,
    settings: MAX_FILE_SIZE.SETTINGS,
    clothing: MAX_FILE_SIZE.CLOTHING
  }
  return typeMap[type] || MAX_FILE_SIZE.STANDARD
}
