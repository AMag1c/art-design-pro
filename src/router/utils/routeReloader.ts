/**
 * 路由重载工具
 *
 * 提供无感刷新菜单和路由配置的能力
 *
 * @module router/utils/routeReloader
 */

import type { Router } from 'vue-router'
import { RouteRegistry, MenuProcessor, IframeRouteManager } from '../core'
import { useMenuStore } from '@/store/modules/menu'
import { ElMessage } from 'element-plus'

class RouteReloader {
  private router: Router | null = null
  private routeRegistry: RouteRegistry | null = null
  private menuProcessor: MenuProcessor | null = null
  private isReloading = false

  /**
   * 初始化路由重载器
   */
  init(router: Router, routeRegistry: RouteRegistry, menuProcessor: MenuProcessor) {
    this.router = router
    this.routeRegistry = routeRegistry
    this.menuProcessor = menuProcessor
  }

  /**
   * 重新加载菜单和路由（无感刷新）
   * @param skipCurrentPageRefresh 是否跳过当前页面的刷新（用于菜单管理页面）
   */
  async reload(skipCurrentPageRefresh = false): Promise<boolean> {
    if (!this.router || !this.routeRegistry || !this.menuProcessor) {
      console.error('[RouteReloader] 未初始化，无法重载路由')
      return false
    }

    if (this.isReloading) {
      console.warn('[RouteReloader] 正在重载中，请稍后再试')
      return false
    }

    this.isReloading = true

    try {
      // 1. 重新获取菜单数据
      const menuList = await this.menuProcessor.getMenuList()

      // 2. 验证菜单数据
      if (!this.menuProcessor.validateMenuList(menuList)) {
        throw new Error('获取菜单列表失败')
      }

      // 3. 移除旧路由
      this.routeRegistry.unregister()

      // 4. 注册新路由
      this.routeRegistry.register(menuList)

      // 5. 更新 menuStore
      const menuStore = useMenuStore()
      menuStore.setMenuList(menuList)
      menuStore.clearRemoveRouteFns()
      menuStore.addRemoveRouteFns(this.routeRegistry.getRemoveRouteFns())

      // 6. 更新 iframe 路由
      IframeRouteManager.getInstance().save()

      // 7. 如果需要跳过当前页面刷新（例如在菜单管理页面修改其他菜单）
      if (skipCurrentPageRefresh) {
        return true
      }

      return true
    } catch (error) {
      console.error('[RouteReloader] 重载失败:', error)
      ElMessage.error('菜单配置更新失败，请刷新页面')
      return false
    } finally {
      this.isReloading = false
    }
  }
}

// 导出单例
export const routeReloader = new RouteReloader()
