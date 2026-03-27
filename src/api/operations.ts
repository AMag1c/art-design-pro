import request from '@/utils/http'

// ==================== 签到配置 ====================

export interface SignInConfigItem {
  id: number
  dayIndex: number
  coins: number
  bonusLabel: string
  updateTime: string
}

export function fetchGetSignInConfig() {
  return request.get<SignInConfigItem[]>({ url: '/api/admin/config/sign-in' })
}

export function fetchUpdateSignInConfig(params: {
  dayIndex: number
  coins: number
  bonusLabel: string
}) {
  return request.put({ url: '/api/admin/config/sign-in', params, showSuccessMessage: true })
}

export interface SignInStats {
  todayCount: number
  totalCount: number
  totalUsers: number
}

export function fetchAdminGetSignInStats() {
  return request.get<SignInStats>({ url: '/api/admin/config/sign-in/stats' })
}

// ==================== VIP套餐管理 ====================

export interface VipPlanItem {
  id: number
  planKey: string
  level: number
  levelName: string
  name: string
  price: number
  originalPrice: number
  durationDays: number
  description: string
  features: string[]
  isPermanent: boolean
  isRecommended: boolean
  isHot: boolean
  discountRate: number
  enabled: boolean
  sortOrder: number
  createTime: string
  updateTime: string
}

export function fetchAdminGetVipPlans() {
  return request.get<VipPlanItem[]>({ url: '/api/admin/config/vip-plans' })
}

export function fetchAdminCreateVipPlan(params: Record<string, any>) {
  return request.post({ url: '/api/admin/config/vip-plans', params, showSuccessMessage: true })
}

export function fetchAdminUpdateVipPlan(id: number, params: Record<string, any>) {
  return request.put({ url: `/api/admin/config/vip-plans/${id}`, params, showSuccessMessage: true })
}

export function fetchAdminDeleteVipPlan(id: number) {
  return request.del({ url: `/api/admin/config/vip-plans/${id}`, showSuccessMessage: true })
}

// ==================== 成就管理 ====================

export type AchievementType = 'total_days' | 'continuous_days' | 'monthly_days'

export interface AchievementItem {
  id: number
  name: string
  description: string
  iconKey: string
  type: AchievementType
  threshold: number
  rewardCoins: number
  sortOrder: number
  enabled: boolean
  createTime: string
  updateTime: string
}

export function fetchAdminGetAchievements() {
  return request.get<AchievementItem[]>({ url: '/api/admin/achievements' })
}

export function fetchAdminCreateAchievement(params: Record<string, any>) {
  return request.post({ url: '/api/admin/achievements', params, showSuccessMessage: true })
}

export function fetchAdminUpdateAchievement(id: number, params: Record<string, any>) {
  return request.put({ url: `/api/admin/achievements/${id}`, params, showSuccessMessage: true })
}

export function fetchAdminDeleteAchievement(id: number) {
  return request.del({ url: `/api/admin/achievements/${id}`, showSuccessMessage: true })
}

// ==================== 站点配置 ====================

export interface SiteConfigItem {
  id: number
  configKey: string
  configValue: string
  description: string
  updateTime: string
}

export function fetchAdminGetSiteConfigs() {
  return request.get<SiteConfigItem[]>({ url: '/api/admin/config/site' })
}

export function fetchAdminUpdateSiteConfigs(configs: { key: string; value: string }[]) {
  return request.put({
    url: '/api/admin/config/site',
    params: { configs },
    showSuccessMessage: true
  })
}

// ==================== 演示数据管理 ====================

export interface DemoStatus {
  seeded: boolean
  seededAt?: string
}

export function fetchDemoStatus() {
  return request.get<DemoStatus>({ url: '/api/admin/demo/status' })
}

export function fetchSeedDemo() {
  return request.post({ url: '/api/admin/demo/seed', showSuccessMessage: true })
}

export function fetchClearDemo() {
  return request.del({ url: '/api/admin/demo/clear', showSuccessMessage: true })
}
