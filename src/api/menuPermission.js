import { post } from '@/utils/request'

/**
 * 获取当前用户的菜单权限
 */
export function getMyMenuPermissions() {
  return post('/menu-permission/my')
}

/**
 * 获取所有菜单项配置
 */
export function getAllMenuItems() {
  return post('/menu-permission/menus')
}

/**
 * 更新用户的菜单权限（仅管理员）
 * @param {string} userId - 用户ID
 * @param {Array<string>} menuPermissions - 菜单权限列表
 */
export function updateUserMenuPermissions(userId, menuPermissions, mode) {
  const payload = { menuPermissions }
  if (mode) {
    payload.mode = mode
  }
  return post(`/menu-permission/user/${userId}`, payload)
}

/**
 * 获取指定用户的菜单权限（管理员）
 * @param {string} userId - 用户ID
 */
export function getUserMenuPermissions(userId) {
  return post(`/menu-permission/user/${userId}/get`)
}

/**
 * 更新用户的VIP等级（仅管理员）
 * @param {string} userId - 用户ID
 * @param {number} vipLevel - VIP等级
 */
export function updateUserVipLevel(userId, vipLevel) {
  return post(`/menu-permission/user/${userId}/vip-level`, { vipLevel })
}

/**
 * 创建菜单权限模板
 * @param {Object} data - 模板数据
 */
export function createMenuTemplate(data) {
  return post('/menu-permission/template/create', data)
}

/**
 * 获取菜单模板列表
 */
export function getMenuTemplateList() {
  return post('/menu-permission/template/list')
}

/**
 * 更新菜单模板
 * @param {string} templateId - 模板ID
 * @param {Object} data - 更新数据
 */
export function updateMenuTemplate(templateId, data) {
  return post(`/menu-permission/template/${templateId}/update`, data)
}

/**
 * 删除菜单模板
 * @param {string} templateId - 模板ID
 */
export function deleteMenuTemplate(templateId) {
  return post(`/menu-permission/template/${templateId}/delete`)
}

/**
 * 应用模板到多个用户
 * @param {string} templateId - 模板ID
 * @param {Array<string>} userIds - 用户ID列表
 */
export function applyMenuTemplate(templateId, userIds) {
  return post(`/menu-permission/template/${templateId}/apply`, { userIds })
}
