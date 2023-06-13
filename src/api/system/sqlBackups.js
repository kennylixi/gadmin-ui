import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询数据库备份表列表
export function listSqlBackups(query) {
  return request({
    url: '/system/sqlBackups/list',
    method: 'get',
    params: query
  })
}

// 新增数据库备份表
export function backups(data) {
  return request({
    url: '/system/sqlBackups',
    method: 'post',
    data: data
  })
}

// 获取解压密码
export function getPwd(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/sqlBackups/pwd/'+id,
    method: 'get'
  })
}

// 恢复数据库备份表
export function recover(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/sqlBackups/recover/'+id,
    method: 'put'
  })
}

// 删除数据库备份表
export function delSqlBackups(backupsIds) {
  return request({
    url: '/system/sqlBackups',
    method: 'delete',
    data: backupsIds
  })
}