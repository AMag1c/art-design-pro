import { AppRouteRecord } from '@/types/router'

export const codeManageRoutes: AppRouteRecord = {
  path: '/code-manage',
  name: 'CodeManage',
  component: '/index/index',
  meta: {
    title: '接码管理',
    icon: 'ri:mail-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'email-imap',
      name: 'EmailImapManage',
      component: '/code-manage/email-imap',
      meta: {
        title: '邮箱IMAP管理',
        icon: 'ri:mail-settings-line',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
