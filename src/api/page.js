// 页面管理相关 API
import { post, get } from '@/utils/request'

/**
 * 创建页面
 * @param {Object} data - 页面数据
 * @param {string} data.name - 页面名称
 * @param {string} data.description - 页面描述
 * @param {Array} data.componentIds - 组件ID数组
 * @param {number} data.order - 排序顺序
 * @param {boolean} data.isActive - 是否启用
 * @param {boolean} data.isPublished - 是否发布
 * @returns {Promise}
 */
export function createPage(data) {
  return post('/page/create', data)
}

/**
 * 查询页面列表（支持分页和条件查询）- 需要鉴权
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {boolean} params.isActive - 是否启用
 * @param {boolean} params.isPublished - 是否发布
 * @param {string} params.name - 名称（模糊搜索）
 * @returns {Promise}
 */
export function getPageList(params) {
  return post('/page/list', params)
}

/**
 * 根据ID查询单个页面 - 需要鉴权
 * @param {string} id - 页面ID
 * @returns {Promise}
 */
export function getPageById(id) {
  return post('/page/findById', { id })
}

/**
 * 更新页面信息
 * @param {string} id - 页面ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updatePage(id, data) {
  return post('/page/update', { id, ...data })
}

/**
 * 删除页面（单个）
 * @param {string} id - 页面ID
 * @returns {Promise}
 */
export function deletePage(id) {
  return post('/page/remove', { id })
}

/**
 * 批量删除页面
 * @param {Array<string>} ids - 页面ID数组
 * @returns {Promise}
 */
export function deletePages(ids) {
  return post('/page/remove', { ids })
}

/**
 * 查询已发布的页面列表（公开访问，无需鉴权）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.name - 名称（模糊搜索）
 * @returns {Promise}
 */
export function getPublicPageList(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.page) queryParams.append('page', params.page)
  if (params.limit) queryParams.append('limit', params.limit)
  if (params.name) queryParams.append('name', params.name)

  return get(`/page/public/list?${queryParams.toString()}`)
}

/**
 * 根据ID查询单个已发布的页面（公开访问，无需鉴权）
 * @param {string} id - 页面ID
 * @returns {Promise}
 */
export function getPublicPageById(id) {
  return get(`/page/public/${id}`)
}
