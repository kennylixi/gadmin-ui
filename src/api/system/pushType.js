import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 获取渠道类型列表
export function listPushType(query) {
  return request({
    url: '/system/pushType/list',
    method: 'get',
    params: query
  })
}

// 获取下级渠道类型列表
export function listPushTypeByParentId(parentId) {
  parentId = parseStrEmpty(parentId)
  if (parentId === '') {
    parentId = 0
  }
  return request({
    url: '/system/pushType/list/' + parentId,
    method: 'get',
  })
}

// 查询渠道类型详细
export function getPushType(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/pushType/' + id,
    method: 'get'
  })
}

// 新增渠道类型
export function addPushType(data) {
  return request({
    url: '/system/pushType',
    method: 'post',
    data: data
  })
}

// 修改渠道类型
export function updatePushType(data) {
  return request({
    url: '/system/pushType',
    method: 'put',
    data: data
  })
}

// 删除渠道类型
export function delPushType(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/pushType/'+id,
    method: 'delete'
  })
}
