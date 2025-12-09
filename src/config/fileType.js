/**
 * 文件类型配置
 * 与后端保持一致的扩展名和MIME类型定义
 */

// 文件类型枚举
export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  DOCUMENT: 'document',
  ARCHIVE: 'archive',
  TEXT: 'text',
  OTHER: 'other'
}

// 图片扩展名列表
export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.ico',
  '.tiff',
  '.tif',
  '.heic',
  '.heif',
  '.avif',
  '.jfif',
  '.jp2',
  '.jpx',
  '.j2k',
  '.j2c',
  '.psd',
  '.raw',
  '.cr2',
  '.nef',
  '.orf',
  '.sr2'
]

// 视频扩展名列表
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv', '.mkv']

// 文档扩展名列表
export const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx']

// 压缩包扩展名列表
export const ARCHIVE_EXTENSIONS = ['.zip', '.rar', '.7z', '.tar', '.gz']

// 文本文件扩展名列表（包含 .md）
export const TEXT_EXTENSIONS = ['.txt', '.csv', '.json', '.xml', '.md', '.markdown']

// 所有扩展名映射
export const EXTENSIONS_MAP = {
  [FILE_TYPES.IMAGE]: IMAGE_EXTENSIONS,
  [FILE_TYPES.VIDEO]: VIDEO_EXTENSIONS,
  [FILE_TYPES.DOCUMENT]: DOCUMENT_EXTENSIONS,
  [FILE_TYPES.ARCHIVE]: ARCHIVE_EXTENSIONS,
  [FILE_TYPES.TEXT]: TEXT_EXTENSIONS
}

// MIME类型映射
export const MIME_TYPES = {
  [FILE_TYPES.IMAGE]: ['image/'],
  [FILE_TYPES.VIDEO]: ['video/'],
  [FILE_TYPES.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd'],
  [FILE_TYPES.ARCHIVE]: [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ],
  [FILE_TYPES.TEXT]: ['text/']
}

// 文件类型标签类型映射（用于 el-tag）
export const FILE_TYPE_TAG_TYPES = {
  [FILE_TYPES.IMAGE]: 'success',
  [FILE_TYPES.VIDEO]: 'primary',
  [FILE_TYPES.DOCUMENT]: 'primary',
  [FILE_TYPES.ARCHIVE]: 'warning',
  [FILE_TYPES.TEXT]: 'info',
  [FILE_TYPES.OTHER]: ''
}

// 文件类型显示名称映射
export const FILE_TYPE_LABELS = {
  [FILE_TYPES.IMAGE]: '图片',
  [FILE_TYPES.VIDEO]: '视频',
  [FILE_TYPES.DOCUMENT]: '文档',
  [FILE_TYPES.ARCHIVE]: '压缩包',
  [FILE_TYPES.TEXT]: '文本',
  [FILE_TYPES.OTHER]: '其他'
}

// 文件类型验证规则（用于 FileUpload 组件）
export const FILE_TYPE_RULES = {
  [FILE_TYPES.IMAGE]: {
    mimeTypes: MIME_TYPES[FILE_TYPES.IMAGE],
    extensions: new RegExp(`\\.(${IMAGE_EXTENSIONS.map(ext => ext.slice(1)).join('|')})$`, 'i'),
    accept: 'image/*',
    getDefaultTip: (maxSize, maxCount) =>
      `支持 jpg/png/gif/webp/bmp/svg/ico/tiff/heic/avif 等多种图片格式，文件大小不超过 ${maxSize}MB，最多${maxCount}个`
  },
  [FILE_TYPES.VIDEO]: {
    mimeTypes: MIME_TYPES[FILE_TYPES.VIDEO],
    extensions: new RegExp(`\\.(${VIDEO_EXTENSIONS.map(ext => ext.slice(1)).join('|')})$`, 'i'),
    accept: 'video/*',
    getDefaultTip: (maxSize, maxCount) =>
      `支持 mp4/webm/ogg/mov/avi/wmv/flv/mkv 格式的视频文件，文件大小不超过 ${maxSize}MB，最多${maxCount}个`
  },
  [FILE_TYPES.DOCUMENT]: {
    mimeTypes: MIME_TYPES[FILE_TYPES.DOCUMENT],
    extensions: new RegExp(`\\.(${DOCUMENT_EXTENSIONS.map(ext => ext.slice(1)).join('|')})$`, 'i'),
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    getDefaultTip: (maxSize, maxCount) =>
      `支持 pdf/doc/docx/xls/xlsx/ppt/pptx 格式的文档文件，文件大小不超过 ${maxSize}MB，最多${maxCount}个`
  },
  all: {
    mimeTypes: [],
    extensions: new RegExp(
      `\\.(${[
        ...IMAGE_EXTENSIONS,
        ...VIDEO_EXTENSIONS,
        ...DOCUMENT_EXTENSIONS,
        ...ARCHIVE_EXTENSIONS,
        ...TEXT_EXTENSIONS
      ]
        .map(ext => ext.slice(1))
        .join('|')})$`,
      'i'
    ),
    accept: '',
    getDefaultTip: (maxSize, maxCount) =>
      `支持多种文件类型：图片、视频、文档、压缩包、文本文件（包含 Markdown），文件大小不超过 ${maxSize}MB，最多${maxCount}个`
  }
}

/**
 * 根据文件名获取文件类型
 * @param {string} filename - 文件名
 * @returns {string} 文件类型
 */
export function getFileTypeFromName(filename) {
  if (!filename) return FILE_TYPES.OTHER
  const ext = `.${filename.toLowerCase().split('.').pop()}`

  if (IMAGE_EXTENSIONS.includes(ext)) return FILE_TYPES.IMAGE
  if (VIDEO_EXTENSIONS.includes(ext)) return FILE_TYPES.VIDEO
  if (DOCUMENT_EXTENSIONS.includes(ext)) return FILE_TYPES.DOCUMENT
  if (ARCHIVE_EXTENSIONS.includes(ext)) return FILE_TYPES.ARCHIVE
  if (TEXT_EXTENSIONS.includes(ext)) return FILE_TYPES.TEXT

  return FILE_TYPES.OTHER
}

/**
 * 获取文件类型的标签类型
 * @param {string} fileType - 文件类型
 * @returns {string} 标签类型
 */
export function getFileTypeTag(fileType) {
  return FILE_TYPE_TAG_TYPES[fileType] || ''
}

/**
 * 获取文件类型的显示名称
 * @param {string} fileType - 文件类型
 * @returns {string} 显示名称
 */
export function getFileTypeName(fileType) {
  return FILE_TYPE_LABELS[fileType] || '未知'
}

/**
 * 检查是否为图片文件
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为图片
 */
export function isImageFile(filename) {
  if (!filename) return false
  const ext = `.${filename.toLowerCase().split('.').pop()}`
  return IMAGE_EXTENSIONS.includes(ext)
}

/**
 * 检查是否为视频文件
 * @param {string} filename - 文件名
 * @returns {boolean} 是否为视频
 */
export function isVideoFile(filename) {
  if (!filename) return false
  const ext = `.${filename.toLowerCase().split('.').pop()}`
  return VIDEO_EXTENSIONS.includes(ext)
}

/**
 * 验证文件扩展名是否属于指定类型
 * @param {string} filename - 文件名
 * @param {string} fileType - 文件类型
 * @returns {boolean} 是否匹配
 */
export function validateFileExtension(filename, fileType) {
  if (!filename || !fileType) return false
  const ext = `.${filename.toLowerCase().split('.').pop()}`
  const allowedExts = EXTENSIONS_MAP[fileType]
  return allowedExts ? allowedExts.includes(ext) : false
}
