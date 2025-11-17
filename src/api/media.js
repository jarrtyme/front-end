// 媒体库相关 API
import { post } from '@/utils/request'

/**
 * 创建媒体记录
 * @param {Object} data - 媒体数据
 * @param {string} data.type - 媒体类型：'image' 或 'video'
 * @param {string} data.url - 媒体文件URL
 * @param {string} data.filename - 文件名
 * @param {number} data.size - 文件大小
 * @param {string} data.mimetype - MIME类型
 * @param {string[]} data.descriptions - 描述数组
 * @returns {Promise}
 */
export function createMedia(data) {
  return post('/media/create', data)
}

/**
 * 获取媒体列表（需要鉴权）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.limit - 每页数量（默认10，最大100）
 * @param {string} params.type - 媒体类型筛选：'image' 或 'video'
 * @param {string} params.description - 描述搜索关键字（支持 | 分隔的多个关键词，如：'关键词1|关键词2'）
 * @returns {Promise}
 */
export function getMediaList(params = {}) {
  return post('/media/list', params)
}

/**
 * 根据ID获取媒体详情
 * @param {string} id - 媒体ID
 * @returns {Promise}
 */
export function getMediaById(id) {
  return post('/media/findById', { id })
}

/**
 * 更新媒体信息
 * @param {string} id - 媒体ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateMedia(id, data) {
  return post('/media/update', { id, ...data })
}

/**
 * 删除媒体（单个）
 * @param {string} id - 媒体ID
 * @returns {Promise}
 */
export function deleteMedia(id) {
  return post('/media/remove', { id })
}

/**
 * 批量删除媒体
 * @param {Array<string>} ids - 媒体ID数组
 * @returns {Promise}
 */
export function deleteMedias(ids) {
  return post('/media/remove', { ids })
}

/**
 * 添加描述
 * @param {string} id - 媒体ID
 * @param {string} text - 描述文本
 * @returns {Promise}
 */
export function addDescription(id, text) {
  return post('/media/addDescription', { id, text })
}

/**
 * 删除描述
 * @param {string} id - 媒体ID
 * @param {string} descriptionId - 描述ID
 * @returns {Promise}
 */
export function removeDescription(id, descriptionId) {
  return post('/media/removeDescription', { id, descriptionId })
}

/**
 * 更新描述
 * @param {string} id - 媒体ID
 * @param {string} descriptionId - 描述ID
 * @param {string} text - 新的描述文本
 * @returns {Promise}
 */
export function updateDescription(id, descriptionId, text) {
  return post('/media/updateDescription', { id, descriptionId, text })
}

/**
 * 批量添加描述
 * @param {Array} items - 批量操作项数组，每个元素包含 { id: '媒体ID', texts: ['描述1', '描述2'] }
 * @returns {Promise}
 */
export function batchAddDescription(items) {
  return post('/media/batchAddDescription', { items })
}

/**
 * 批量创建媒体记录（批量添加到媒体库）
 * @param {Array} items - 批量操作项数组，每个元素包含 { type, url, filename, size, mimetype, descriptions }
 * @param {string} items[].type - 媒体类型：'image' 或 'video'
 * @param {string} items[].url - 媒体文件URL
 * @param {string} items[].filename - 文件名（可选）
 * @param {number} items[].size - 文件大小（可选）
 * @param {string} items[].mimetype - MIME类型（可选）
 * @param {Array<string>} items[].descriptions - 描述数组（可选）
 * @returns {Promise}
 */
export function batchCreateMedia(items) {
  return post('/media/batchCreate', { items })
}
