import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询消息模板列表
export function listPushTemplate(query) {
  return request({
    url: '/system/pushTemplate/list',
    method: 'get',
    params: query
  })
}

// 查询消息模板详细
export function getPushTemplate(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/pushTemplate/' + id,
    method: 'get'
  })
}

// 测试消息模板
export function testPushTemplate(data) {
  return request({
    url: '/system/pushTemplate/test',
    method: 'post',
    data: data
  })
}

// 新增消息模板
export function addPushTemplate(data) {
  return request({
    url: '/system/pushTemplate',
    method: 'post',
    data: data
  })
}

// 修改消息模板
export function updatePushTemplate(data) {
  return request({
    url: '/system/pushTemplate',
    method: 'put',
    data: data
  })
}

// 删除消息模板
export function delPushTemplate(id) {
  return request({
    url: '/system/pushTemplate',
    method: 'delete',
    data: id
  })
}
