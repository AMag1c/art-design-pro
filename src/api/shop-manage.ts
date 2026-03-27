import request from '@/utils/http'

// ==================== 分类管理 ====================

export interface CategoryItem {
  id: number
  parentId: number
  name: string
  description?: string
  icon?: string
  sortOrder: number
  enabled: boolean
  createTime: string
  updateTime: string
}

// 获取所有分类（管理端，含禁用分类）
export function fetchAdminGetCategories() {
  return request.get<CategoryItem[]>({
    url: '/api/admin/shop/categories',
    params: { admin: 1 }
  })
}

// 创建分类
export function fetchCreateCategory(params: Record<string, any>) {
  return request.post({
    url: '/api/admin/shop/categories',
    params,
    showSuccessMessage: true
  })
}

// 更新分类
export function fetchUpdateCategory(id: number, params: Record<string, any>) {
  return request.put({
    url: `/api/admin/shop/categories/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除分类
export function fetchDeleteCategory(id: number) {
  return request.del({
    url: `/api/admin/shop/categories/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 商品管理 ====================

export interface AdminProductParams {
  current: number
  size: number
  categoryId?: number
  keyword?: string
  status?: string
}

export interface ProductItem {
  id: number
  categoryId: number
  name: string
  description?: string
  coverImage?: string
  price: number
  originalPrice?: number
  stock: number
  soldCount: number
  status: 'on_sale' | 'off_sale'
  sortOrder: number
  createTime: string
  updateTime: string
  category?: { id: number; name: string }
}

// 获取商品列表（管理端）
export function fetchAdminGetProducts(params: AdminProductParams) {
  return request.get({
    url: '/api/admin/shop/products',
    params
  })
}

// 创建商品
export function fetchCreateProduct(params: Record<string, any>) {
  return request.post({
    url: '/api/admin/shop/products',
    params,
    showSuccessMessage: true
  })
}

// 更新商品
export function fetchUpdateProduct(id: number, params: Record<string, any>) {
  return request.put({
    url: `/api/admin/shop/products/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除商品
export function fetchDeleteProduct(id: number) {
  return request.del({
    url: `/api/admin/shop/products/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 游戏分类管理 ====================

export interface GameCategory {
  id: number
  name: string
  nameEn?: string
  icon?: string
  coverImage?: string
  description?: string
  sortOrder: number
  enabled: boolean
  createTime: string
  updateTime: string
}

// 获取游戏分类（管理端，含禁用）
export function fetchAdminGetGameCategories() {
  return request.get<GameCategory[]>({
    url: '/api/admin/game/categories'
  })
}

// 创建游戏分类
export function fetchCreateGameCategory(params: Record<string, any>) {
  return request.post({
    url: '/api/admin/game/categories',
    params,
    showSuccessMessage: true
  })
}

// 更新游戏分类
export function fetchUpdateGameCategory(id: number, params: Record<string, any>) {
  return request.put({
    url: `/api/admin/game/categories/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除游戏分类
export function fetchDeleteGameCategory(id: number) {
  return request.del({
    url: `/api/admin/game/categories/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 游戏管理 ====================

export interface AdminGameParams {
  current: number
  size: number
  categoryId?: number
  keyword?: string
  status?: string
}

export interface DownloadLink {
  name: string
  url: string
  password?: string
}

export interface GameItem {
  id: number
  name: string
  nameEn?: string
  coverImage?: string
  description?: string
  categoryId: number
  category: string // 虚拟字段，后端从分类表填充
  tags?: any
  price: number
  originalPrice?: number
  memberPrice: number
  isFeatured: boolean
  downloads: number
  views: number
  likes: number
  rating: number
  status: 'on_sale' | 'off_sale'
  sortOrder: number
  releaseDate?: string
  version?: string
  size?: string
  language?: string
  support?: string
  activationCode?: string
  validDays: number
  downloadLinks?: DownloadLink[]
  screenshots?: string[]
  videoUrl?: string
  createTime: string
  updateTime: string
}

// 获取游戏详情（管理端，含 downloadLinks）
export function fetchAdminGetGameDetail(id: number) {
  return request.get<GameItem>({
    url: `/api/admin/game/items/${id}`
  })
}

// 获取游戏列表（管理端）
export function fetchAdminGetGameItems(params: AdminGameParams) {
  return request.get({
    url: '/api/admin/game/items',
    params
  })
}

// 创建游戏
export function fetchCreateGameItem(params: Record<string, any>) {
  return request.post({
    url: '/api/admin/game/items',
    params,
    showSuccessMessage: true
  })
}

// 更新游戏
export function fetchUpdateGameItem(id: number, params: Record<string, any>) {
  return request.put({
    url: `/api/admin/game/items/${id}`,
    params,
    showSuccessMessage: true
  })
}

// 删除游戏
export function fetchDeleteGameItem(id: number) {
  return request.del({
    url: `/api/admin/game/items/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 订单管理 ====================

export interface AdminOrderParams {
  current: number
  size: number
  status?: string
}

export interface OrderCardKey {
  id: number
  productId: number
  orderId?: number
  content: string
  status: 'unused' | 'used' | 'invalid'
  usedAt?: string
  createTime: string
}

export interface AdminOrderItem {
  id: number
  orderNo: string
  userId: number
  productId: number
  productSnapshot: { id: number; name: string; coverImage?: string; price: number }
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'pending' | 'paid' | 'delivering' | 'completed' | 'cancelled' | 'refunding' | 'refunded'
  paymentMethod: string
  remark?: string
  payTime?: string
  completeTime?: string
  cancelTime?: string
  createTime: string
  updateTime: string
  cardKeys?: OrderCardKey[]
}

export function fetchAdminGetOrders(params: AdminOrderParams) {
  return request.get({ url: '/api/admin/shop/orders', params })
}

// ==================== 卡密管理 ====================

export interface AdminCardKeyParams {
  current: number
  size: number
  productId?: number
  status?: string
}

export function fetchAdminGetCardKeys(params: AdminCardKeyParams) {
  return request.get({ url: '/api/admin/shop/card-keys', params })
}

export function fetchAdminAddCardKeys(params: { productId: number; keys: string[] }) {
  return request.post({ url: '/api/admin/shop/card-keys', params, showSuccessMessage: true })
}

export function fetchAdminDeleteCardKey(id: number) {
  return request.del({ url: `/api/admin/shop/card-keys/${id}`, showSuccessMessage: true })
}

// ==================== 工单管理 ====================

export interface AdminTicketParams {
  current: number
  size: number
  status?: string
  category?: string
}

export interface TicketMessage {
  id: number
  ticketId: number
  senderId: number
  senderType: 'user' | 'admin'
  content: string
  createTime: string
}

export interface AdminTicketItem {
  id: number
  ticketNo: string
  userId: number
  orderId?: number
  title: string
  category: 'general' | 'payment' | 'account' | 'order' | 'other'
  status: 'open' | 'processing' | 'resolved' | 'closed'
  closeTime?: string
  createTime: string
  updateTime: string
  messages?: TicketMessage[]
}

export function fetchAdminGetTickets(params: AdminTicketParams) {
  return request.get({ url: '/api/admin/shop/tickets', params })
}

export function fetchAdminGetTicketDetail(id: number) {
  return request.get<AdminTicketItem>({ url: `/api/admin/shop/tickets/${id}` })
}

export function fetchAdminReplyTicket(id: number, content: string) {
  return request.post({
    url: `/api/admin/shop/tickets/${id}/reply`,
    params: { content },
    showSuccessMessage: true
  })
}

export function fetchAdminUpdateTicketStatus(id: number, status: string) {
  return request.put({
    url: `/api/admin/shop/tickets/${id}/status`,
    params: { status },
    showSuccessMessage: true
  })
}
