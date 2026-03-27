import { AppRouteRecord } from '@/types/router'

export const productManageRoutes: AppRouteRecord = {
  path: '/product-manage',
  name: 'ProductManage',
  component: '/index/index',
  meta: {
    title: '商品管理',
    icon: 'ri:store-2-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'categories',
      name: 'ProductCategories',
      component: '/product-manage/categories',
      meta: {
        title: '商品分类',
        icon: 'ri:layout-grid-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'products',
      name: 'ProductsManage',
      component: '/product-manage/products',
      meta: {
        title: '商品管理',
        icon: 'ri:shopping-bag-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
