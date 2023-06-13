import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询渠道管理列表
export function listPushChannel(query) {
  return request({
    url: '/system/pushChannel/list',
    method: 'get',
    params: query
  })
}

// 查询渠道管理列表
export function listSimplePushChannel(query) {
  return request({
    url: '/system/pushChannel/list/simple',
    method: 'get',
    params: query
  })
}

// 查询渠道管理详细
export function getPushChannel(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/pushChannel/' + id,
    method: 'get'
  })
}

// 获取渠道模板参数
export function getPushChannelTemplateParams(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/pushChannel/template_params/' + id,
    method: 'get'
  })
}

// 新增渠道管理
export function addPushChannel(data) {
  return request({
    url: '/system/pushChannel',
    method: 'post',
    data: data
  })
}

// 修改渠道管理
export function updatePushChannel(data) {
  return request({
    url: '/system/pushChannel',
    method: 'put',
    data: data
  })
}

// 删除渠道管理
export function delPushChannel(id) {
  return request({
    url: '/system/pushChannel',
    method: 'delete',
    data: id
  })
}
