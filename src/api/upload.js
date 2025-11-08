// 图片上传和管理相关 API
import { post } from '@/utils/request'

/**
 * 获取图片列表
 * @returns {Promise}
 */
export function getImageList() {
  return post('/upload/list', {})
}

/**
 * 删除图片
 * @param {string} filename - 文件名
 * @returns {Promise}
 */
export function deleteImage(filename) {
  return post('/upload/delete', { filename })
}

/**
 * 批量上传图片
 * @param {FileList|File[]} files - 要上传的图片文件列表
 * @returns {Promise}
 */
export function uploadImages(files) {
  const formData = new FormData()

  // 将文件添加到 FormData
  if (files instanceof FileList) {
    Array.from(files).forEach(file => {
      formData.append('file', file)
    })
  } else if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('file', file)
    })
  } else {
    formData.append('file', files)
  }

  // 获取 token
  const token = localStorage.getItem('token')

  // 构建请求 URL
  const baseUrl = import.meta.env.VITE_API_PREFIX || '/api'
  const url = baseUrl.startsWith('http')
    ? `${baseUrl}/upload/images`
    : `${window.location.protocol}//${window.location.host}${baseUrl}/upload/images`

  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
      // 不要设置 Content-Type，让浏览器自动设置，以便正确设置 boundary
    },
    body: formData
  }).then(async response => {
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || '上传失败')
    }
    return data
  })
}
