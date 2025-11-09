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
 * 获取媒体列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.type - 媒体类型筛选：'image' 或 'video'
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
 * 删除媒体
 * @param {string} id - 媒体ID
 * @returns {Promise}
 */
export function deleteMedia(id) {
  return post('/media/remove', { id })
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
