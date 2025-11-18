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
export function updateUserMenuPermissions(userId, menuPermissions) {
  return post(`/menu-permission/user/${userId}`, { menuPermissions })
}

/**
 * 更新用户的VIP等级（仅管理员）
 * @param {string} userId - 用户ID
 * @param {number} vipLevel - VIP等级
 */
export function updateUserVipLevel(userId, vipLevel) {
  return post(`/menu-permission/user/${userId}/vip-level`, { vipLevel })
}
