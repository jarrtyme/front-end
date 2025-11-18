// 系统设置相关 API
import { post } from '@/utils/request'

/**
 * 获取基本设置
 * @returns {Promise}
 */
export function getBasicSettings() {
  return post('/settings/getBasic', {})
}

/**
 * 更新基本设置
 * @param {Object} data - 基本设置数据
 * @param {string} data.siteName - 网站名称
 * @param {string} data.siteDescription - 网站描述
 * @param {string} data.logo - 网站Logo URL
 * @returns {Promise}
 */
export function updateBasicSettings(data) {
  return post('/settings/updateBasic', data)
}

/**
 * 获取安全设置
 * @returns {Promise}
 */
export function getSecuritySettings() {
  return post('/settings/getSecurity', {})
}

/**
 * 更新安全设置
 * @param {Object} data - 安全设置数据
 * @param {boolean} data.allowRegister - 允许注册
 * @param {boolean} data.requireEmailVerify - 需要邮箱验证
 * @param {number} data.minPasswordLength - 密码最小长度
 * @param {number} data.sessionTimeout - 会话超时时间（分钟）
 * @returns {Promise}
 */
export function updateSecuritySettings(data) {
  return post('/settings/updateSecurity', data)
}

/**
 * 获取通知设置
 * @returns {Promise}
 */
export function getNotificationSettings() {
  return post('/settings/getNotification', {})
}

/**
 * 更新通知设置
 * @param {Object} data - 通知设置数据
 * @param {boolean} data.emailNotification - 邮件通知
 * @param {boolean} data.smsNotification - 短信通知
 * @param {boolean} data.systemNotification - 系统通知
 * @returns {Promise}
 */
export function updateNotificationSettings(data) {
  return post('/settings/updateNotification', data)
}

/**
 * 获取所有设置
 * @returns {Promise}
 */
export function getAllSettings() {
  return post('/settings/getAll', {})
}
