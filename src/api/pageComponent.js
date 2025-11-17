// 页面组件管理相关 API
import { post } from '@/utils/request'

/**
 * 创建页面组件
 * @param {Object} data - 组件数据
 * @param {string} data.name - 组件名称
 * @param {string} data.displayType - 展示类型：'carousel', 'grid', 'list', 'scroll-snap', 'seamless'
 * @param {Array} data.items - 组件项数组
 * @param {number} data.order - 排序顺序
 * @param {boolean} data.isActive - 是否启用
 * @returns {Promise}
 */
export function createPageComponent(data) {
  return post('/page-component/create', data)
}

/**
 * 查询页面组件列表（支持分页和条件查询）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {boolean} params.isActive - 是否启用
 * @param {string} params.displayType - 展示类型
 * @param {string} params.name - 名称（模糊搜索）
 * @returns {Promise}
 */
export function getPageComponentList(params) {
  return post('/page-component/list', params)
}

/**
 * 根据ID查询单个页面组件
 * @param {string} id - 组件ID
 * @returns {Promise}
 */
export function getPageComponentById(id) {
  return post('/page-component/findById', { id })
}

/**
 * 更新页面组件信息
 * @param {string} id - 组件ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updatePageComponent(id, data) {
  return post('/page-component/update', { id, ...data })
}

/**
 * 删除页面组件（单个）
 * @param {string} id - 组件ID
 * @returns {Promise}
 */
export function deletePageComponent(id) {
  return post('/page-component/remove', { id })
}

/**
 * 批量删除页面组件
 * @param {Array<string>} ids - 组件ID数组
 * @returns {Promise}
 */
export function deletePageComponents(ids) {
  return post('/page-component/remove', { ids })
}
