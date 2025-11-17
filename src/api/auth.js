// 认证相关 API
import { post } from '@/utils/request'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {string} data.username - 用户名（必填，3-20字符）
 * @param {string} data.email - 邮箱地址（必填）
 * @param {string} data.password - 密码（必填，至少6字符）
 * @param {string} data.role - 角色（可选，默认为user）
 * @returns {Promise}
 */
export function register(data) {
  return post('/auth/register', data)
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise}
 */
export function login(data) {
  return post('/auth/login', data)
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return post('/auth/profile')
}

/**
 * 验证Token
 * @returns {Promise}
 */
export function verifyToken() {
  return post('/auth/verify')
}

/**
 * 更新用户信息
 * @param {Object} data - 更新数据
 * @param {string} data.username - 用户名（可选）
 * @param {string} data.email - 邮箱（可选）
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  return post('/auth/update', data)
}

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码（至少6个字符）
 * @returns {Promise}
 */
export function changePassword(data) {
  return post('/auth/change-password', data)
}
