import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询驱动配置列表
export function listFileDriver(query) {
  return request({
    url: '/system/fileDriver/list',
    method: 'get',
    params: query
  })
}

// 查询驱动配置详细
export function getFileDriver(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/fileDriver/' + id,
    method: 'get'
  })
}

// 新增驱动配置
export function addFileDriver(data) {
  return request({
    url: '/system/fileDriver',
    method: 'post',
    data: data
  })
}

// 修改驱动配置
export function updateFileDriver(data) {
  return request({
    url: '/system/fileDriver',
    method: 'put',
    data: data
  })
}

// 删除驱动配置
export function delFileDriver(id) {
  return request({
    url: '/system/fileDriver',
    method: 'delete',
    data: id
  })
}

// 设置为主驱动
export function setMasterFileDriver(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/fileDriver/master/'+id,
    method: 'put',
  })
}

// 测试驱动
export function testFileDriver(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/fileDriver/test/'+id,
    method: 'put',
  })
}
