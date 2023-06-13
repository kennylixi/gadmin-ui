import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 同步行政区域结构
export function sync() {
  return request({
    url: '/system/district/sync',
    method: 'get',
  })
}

// 获取下级行政区域列表
export function listDistrict(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/district/list/' + id,
    method: 'get',
  })
}

// 获取包含指定级行政区域的树形结构
export function listExclude(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/district/exclude/' + id,
    method: 'get',
  })
}

// 查询行政区详细
export function getDistrict(id) {
  id = parseStrEmpty(id)
  if (id === '') {
    id = 0
  }
  return request({
    url: '/system/district/' + id,
    method: 'get'
  })
}

// 新增行政区域
export function addDistrict(data) {
  return request({
    url: '/system/district',
    method: 'post',
    data: data
  })
}

// 修改行政区域
export function updateDistrict(data) {
  return request({
    url: '/z/district',
    method: 'put',
    data: data
  })
}

// 删除行政区域
export function delDistrict(Id) {
  return request({
    url: '/z/district',
    method: 'delete',
    data: Id
  })
}
