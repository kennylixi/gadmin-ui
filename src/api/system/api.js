import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询接口管理列表
export function listApi(query) {
  return request({
    url: '/system/api/list',
    method: 'get',
    params: query
  })
}

// 查询接口模块列表
export function listApiModule() {
  return request({
    url: '/system/api/module/list',
    method: 'get',
  })
}

// 重新导入所有接口
export function reimportApi() {
  return request({
    url: '/system/api/reimport',
    method: 'put',
  })
}

// 查询接口管理详细
export function getApi(apiId) {
  apiId = parseStrEmpty(apiId)
  if (apiId === '') {
    apiId = 0
  }
  return request({
    url: '/system/api/' + apiId,
    method: 'get'
  })
}

// 查询接口下拉树结构
export function treeselect() {
  return request({
    url: '/system/api/treeselect',
    method: 'get'
  })
}

// 根据角色ID查询接口下拉树结构
export function roleApiTreeselect(roleId) {
  return request({
    url: '/system/api/roleApiTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增接口管理
export function addApi(data) {
  return request({
    url: '/system/api',
    method: 'post',
    data: data
  })
}

// 修改接口管理
export function updateApi(data) {
  return request({
    url: '/system/api',
    method: 'put',
    data: data
  })
}

// 删除接口管理
export function delApi(apiId) {
  return request({
    url: '/system/api',
    method: 'delete',
    data: apiId
  })
}