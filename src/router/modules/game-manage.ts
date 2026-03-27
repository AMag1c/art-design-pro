import { AppRouteRecord } from '@/types/router'

export const gameManageRoutes: AppRouteRecord = {
  path: '/game-manage',
  name: 'GameManage',
  component: '/index/index',
  meta: {
    title: '游戏商城',
    icon: 'ri:gamepad-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'game-categories',
      name: 'GameCategories',
      component: '/game-manage/game-categories',
      meta: {
        title: '游戏分类',
        icon: 'ri:layout-grid-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'game-store',
      name: 'GameStoreManage',
      component: '/game-manage/game-store',
      meta: {
        title: '游戏管理',
        icon: 'ri:game-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'vip',
      name: 'VipPlansManage',
      component: '/game-manage/vip',
      meta: {
        title: 'VIP套餐',
        icon: 'ri:vip-crown-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'sign-in',
      name: 'SignInManage',
      component: '/game-manage/sign-in',
      meta: {
        title: '签到管理',
        icon: 'ri:calendar-check-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'achievements',
      name: 'AchievementsManage',
      component: '/game-manage/achievements',
      meta: {
        title: '成就管理',
        icon: 'ri:trophy-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
