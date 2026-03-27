import request from '@/utils/http'

/**
 * 上传文件到 MinIO（管理端）
 * @param file 文件对象
 * @param type 存储类型：product-cover | game-cover | category-icon | product-gallery
 * @returns { url: string } 公开访问 URL
 */
export function uploadFile(file: File, type: string) {
  const form = new FormData()
  form.append('file', file)
  form.append('type', type)
  return request.post<{ url: string }>({ url: '/api/admin/upload', data: form })
}

export interface FileItem {
  key: string
  url: string
  size: number // bytes
  lastModified: string // "2006-01-02 15:04:05"
}

/** 列出指定目录的文件（直接访问 .data.list，不经过 useTable） */
export function fetchFileList(dir: string, page: number, size: number) {
  return request.get<{ list: FileItem[]; total: number; page: number; size: number }>({
    url: '/api/admin/files',
    params: { dir, page, size }
  })
}

/** 删除文件（DELETE body 需用 data 字段，不能用 params） */
export function fetchDeleteFile(key: string) {
  return request.delete({ url: '/api/admin/files', data: { key } })
}
