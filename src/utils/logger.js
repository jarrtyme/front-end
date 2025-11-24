/**
 * 统一日志工具
 * 开发环境输出日志，生产环境静默
 */

const isDevelopment = import.meta.env.DEV

/**
 * 日志级别
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

/**
 * 日志工具类
 */
class Logger {
  constructor() {
    this.level = isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR
  }

  /**
   * 调试日志（仅开发环境）
   * @param {...any} args - 日志参数
   */
  debug(...args) {
    if (this.level <= LogLevel.DEBUG && isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * 信息日志（仅开发环境）
   * @param {...any} args - 日志参数
   */
  info(...args) {
    if (this.level <= LogLevel.INFO && isDevelopment) {
      console.info('[INFO]', ...args)
    }
  }

  /**
   * 警告日志（开发环境输出，生产环境静默）
   * @param {...any} args - 日志参数
   */
  warn(...args) {
    if (this.level <= LogLevel.WARN && isDevelopment) {
      console.warn('[WARN]', ...args)
    }
  }

  /**
   * 错误日志（始终输出）
   * @param {...any} args - 日志参数
   */
  error(...args) {
    if (this.level <= LogLevel.ERROR) {
      console.error('[ERROR]', ...args)
    }
  }
}

// 创建单例实例
const logger = new Logger()

// 导出日志方法
export const log = logger.debug.bind(logger)
export const info = logger.info.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)

// 导出默认对象（兼容 console 的使用方式）
export default {
  log,
  info,
  warn,
  error,
  debug: log
}
