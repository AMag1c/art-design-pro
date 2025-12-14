import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// ==================== 用户管理 ====================

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 创建用户
export function fetchCreateUser(params: Api.SystemManage.CreateUserParams) {
  return request.post({
    url: '/api/user',
    params,
    showSuccessMessage: true
  })
}

// 更新用户
export function fetchUpdateUser(id: number, params: Api.SystemManage.UpdateUserParams) {
  return request.put({
    url: `/api/user/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del({
    url: `/api/user/${id}`,
    showSuccessMessage: true
  })
}

// 批量删除用户
export function fetchBatchDeleteUsers(ids: number[]) {
  return request.del({
    url: '/api/user/batch',
    params: { ids },
    showSuccessMessage: true
  })
}

// ==================== 角色管理 ====================

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 创建角色
export function fetchCreateRole(params: Api.SystemManage.CreateRoleParams) {
  return request.post({
    url: '/api/role',
    params,
    showSuccessMessage: true
  })
}

// 更新角色
export function fetchUpdateRole(id: number, params: Api.SystemManage.UpdateRoleParams) {
  return request.put({
    url: `/api/role/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除角色
export function fetchDeleteRole(id: number) {
  return request.del({
    url: `/api/role/${id}`,
    showSuccessMessage: true
  })
}

// 获取角色权限配置
export function fetchGetRolePermissions(roleId: number) {
  return request.get<Api.SystemManage.RolePermissions>({
    url: `/api/role/${roleId}/permissions`
  })
}

// 更新角色权限配置
export function fetchUpdateRolePermissions(
  roleId: number,
  params: Api.SystemManage.UpdateRolePermissionsParams
) {
  return request.put({
    url: `/api/role/${roleId}/permissions`,
    params,
    showSuccessMessage: false // 改为 false，由组件显示通知
  })
}

// ==================== 菜单管理 ====================

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/menu'
  })
}

// 创建菜单
export function fetchCreateMenu(params: Api.SystemManage.CreateMenuParams) {
  return request.post({
    url: '/api/menu',
    params,
    showSuccessMessage: true
  })
}

// 更新菜单
export function fetchUpdateMenu(id: number, params: Api.SystemManage.UpdateMenuParams) {
  return request.put({
    url: `/api/menu/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除菜单
export function fetchDeleteMenu(id: number) {
  return request.del({
    url: `/api/menu/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 按钮权限管理 ====================

// 创建按钮权限
export function fetchCreatePermission(params: Api.SystemManage.CreateButtonPermissionParams) {
  return request.post({
    url: '/api/menu/button',
    params,
    showSuccessMessage: true
  })
}

// 更新按钮权限
export function fetchUpdatePermission(
  id: number,
  params: Api.SystemManage.UpdateButtonPermissionParams
) {
  return request.put({
    url: `/api/menu/button/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除按钮权限
export function fetchDeletePermission(id: number) {
  return request.del({
    url: `/api/menu/button/${id}`,
    showSuccessMessage: true
  })
}
