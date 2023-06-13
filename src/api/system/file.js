import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询文件管理列表
export function listFile(query) {
  return request({
    url: '/system/file/list',
    method: 'get',
    params: query
  })
}

// 查询文件管理详细
export function getFile(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/file/' + id,
    method: 'get'
  })
}

// 删除文件管理
export function delFile(id) {
  return request({
    url: '/system/file',
    method: 'delete',
    data: id
  })
}
