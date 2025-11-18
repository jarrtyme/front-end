// 用户管理相关 API
import { post } from '@/utils/request'

/**
 * 获取用户列表（管理员）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.username - 用户名搜索
 * @param {string} params.email - 邮箱搜索
 * @returns {Promise}
 */
export function getUserList(params = {}) {
  return post('/auth/users', params)
}

/**
 * 更新用户角色（管理员）
 * @param {string} userId - 用户ID
 * @param {string} role - 角色
 * @returns {Promise}
 */
export function updateUserRole(userId, role) {
  return post(`/auth/users/${userId}/role`, { role })
}

/**
 * 禁用/启用用户（管理员）
 * @param {string} userId - 用户ID
 * @param {boolean} isActive - 是否启用
 * @returns {Promise}
 */
export function updateUserStatus(userId, isActive) {
  return post(`/auth/users/${userId}/status`, { isActive })
}

/**
 * 更新用户信息（管理员）
 * @param {string} userId - 用户ID
 * @param {Object} data - 更新数据
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @param {string} data.role - 角色
 * @param {number} data.vipLevel - VIP等级
 * @param {boolean} data.isActive - 是否激活
 * @returns {Promise}
 */
export function updateUser(userId, data) {
  return post(`/auth/users/${userId}/update`, data)
}

/**
 * 更新用户VIP等级（管理员）
 * @param {string} userId - 用户ID
 * @param {number} vipLevel - VIP等级
 * @returns {Promise}
 */
export function updateUserVipLevel(userId, vipLevel) {
  return post(`/menu-permission/user/${userId}/vip-level`, { vipLevel })
}

/**
 * 更新用户菜单权限（管理员）
 * @param {string} userId - 用户ID
 * @param {Array<string>} menuPermissions - 菜单权限列表
 * @returns {Promise}
 */
export function updateUserMenuPermissions(userId, menuPermissions) {
  return post(`/menu-permission/user/${userId}`, { menuPermissions })
}

/**
 * 删除用户（管理员）
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function deleteUser(userId) {
  return post(`/auth/users/${userId}/delete`, {})
}
