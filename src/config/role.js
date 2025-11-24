/**
 * 用户角色配置
 * 与后端 userModel.js 保持一致的角色定义
 */

// 角色枚举（与后端完全一致）
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  VIP: 'vip',
  USER: 'user'
}

// 角色值数组（用于验证）
export const ROLE_VALUES = Object.values(ROLES)

// 默认角色
export const DEFAULT_ROLE = ROLES.USER

// 角色标签类型映射（用于 el-tag）
export const ROLE_TAG_TYPES = {
  [ROLES.SUPER_ADMIN]: 'danger',
  [ROLES.ADMIN]: 'warning',
  [ROLES.VIP]: 'success',
  [ROLES.USER]: 'info'
}

// 角色显示名称映射
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: '超级管理员',
  [ROLES.ADMIN]: '管理员',
  [ROLES.VIP]: 'VIP', // 需要配合 vipLevel 使用
  [ROLES.USER]: '普通用户'
}

/**
 * 获取角色显示名称
 * @param {string} role - 角色
 * @param {number} vipLevel - VIP等级（可选，仅当 role 为 'vip' 时使用）
 * @returns {string} 角色显示名称
 */
export function getRoleLabel(role, vipLevel = null) {
  if (role === ROLES.VIP && vipLevel != null) {
    return `VIP${vipLevel || ''}`
  }
  return ROLE_LABELS[role] || role || '未知'
}

/**
 * 获取角色标签类型
 * @param {string} role - 角色
 * @returns {string} 标签类型（primary/success/info/warning/danger）
 */
export function getRoleTagType(role) {
  return ROLE_TAG_TYPES[role] || 'info'
}

/**
 * 验证角色是否有效
 * @param {string} role - 角色
 * @returns {boolean} 是否有效
 */
export function isValidRole(role) {
  return ROLE_VALUES.includes(role)
}

/**
 * 检查是否为超级管理员
 * @param {string} role - 角色
 * @returns {boolean} 是否为超级管理员
 */
export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN
}

/**
 * 检查是否为管理员（包括超级管理员）
 * @param {string} role - 角色
 * @returns {boolean} 是否为管理员
 */
export function isAdmin(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN
}
