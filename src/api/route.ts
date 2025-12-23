import request from '@/utils/http'
import type { AppRouteRecord } from '@/types/router'

/**
 * 获取管理员动态路由（基于角色权限过滤）
 * @returns 管理员路由列表
 */
export function fetchGetAdminRoutes() {
  return request.get<AppRouteRecord[]>({
    url: '/api/admin/routes'
  })
}
