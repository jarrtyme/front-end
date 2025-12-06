// 服装管理相关 API
import { post } from '@/utils/request'

/**
 * 创建服装入库记录
 * @param {Object} data - 服装数据
 * @returns {Promise}
 */
export function createClothing(data) {
  return post('/clothing/create', data)
}

/**
 * 查询服装列表（支持分页和条件查询）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {Object} params.query - 查询条件
 * @returns {Promise}
 */
export function findClothing(params) {
  return post('/clothing/find', params)
}

/**
 * 根据ID查询单个服装
 * @param {string} id - 服装ID
 * @returns {Promise}
 */
export function findClothingById(id) {
  return post('/clothing/findById', { id })
}

/**
 * 更新服装信息
 * @param {string} id - 服装ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateClothing(id, data) {
  return post('/clothing/update', { id, ...data })
}

/**
 * 删除服装记录
 * @param {string} id - 服装ID
 * @returns {Promise}
 */
export function removeClothing(id) {
  return post('/clothing/remove', { id })
}

/**
 * 补货操作
 * @param {string} id - 服装ID
 * @param {number} quantity - 补货数量
 * @returns {Promise}
 */
export function restockClothing(id, quantity) {
  return post('/clothing/restock', { id, quantity })
}

/**
 * 获取库存统计
 * @returns {Promise}
 */
export function getClothingStats() {
  return post('/clothing/stats', {})
}

/**
 * 绑定页面到服装（只能绑定一个）
 * @param {string} id - 服装ID
 * @param {string} pageId - 页面ID
 * @returns {Promise}
 */
export function bindPage(id, pageId) {
  return post('/clothing/bindPage', { id, pageId })
}

/**
 * 解绑页面
 * @param {string} id - 服装ID
 * @returns {Promise}
 */
export function unbindPage(id) {
  return post('/clothing/unbindPage', { id })
}

/**
 * 获取服装绑定的页面（查询接口）
 * @param {string} id - 服装ID
 * @returns {Promise}
 */
export function getBoundPage(id) {
  return post('/clothing/getBoundPage', { id })
}

/**
 * 获取公开的服装详情（不需要登录）
 * @param {string} id - 服装ID
 * @returns {Promise}
 */
export function getClothingPublicDetail(id) {
  return post('/clothing/getPublicDetail', { id })
}
