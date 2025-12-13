import { AppRouteRecord } from '@/types/router'

export const shopManageRoutes: AppRouteRecord = {
  path: '/shop-manage',
  name: 'ShopManage',
  component: '/index/index',
  meta: {
    title: '商店管理',
    icon: 'ri:store-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'products',
      name: 'ProductsManage',
      component: '/shop-manage/products',
      meta: {
        title: '商品商店管理',
        icon: 'ri:shopping-bag-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'game-store',
      name: 'GameStoreManage',
      component: '/shop-manage/game-store',
      meta: {
        title: '游戏商店管理',
        icon: 'ri:gamepad-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
