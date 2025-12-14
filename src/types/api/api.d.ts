/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: number[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 创建用户参数 */
    interface CreateUserParams {
      userName: string
      password: string
      nickName?: string
      avatar?: string
      userGender?: string
      userPhone?: string
      userEmail?: string
      status?: string
      roleIds?: number[]
    }

    /** 更新用户参数 */
    interface UpdateUserParams {
      userName?: string
      password?: string
      nickName?: string
      avatar?: string
      userGender?: string
      userPhone?: string
      userEmail?: string
      status?: string
      roleIds?: number[]
    }

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >

    /** 创建角色参数 */
    interface CreateRoleParams {
      roleName: string
      roleCode: string
      description?: string
      enabled?: boolean
      menuIds?: number[]
    }

    /** 更新角色参数 */
    interface UpdateRoleParams {
      roleName?: string
      roleCode?: string
      description?: string
      enabled?: boolean
      menuIds?: number[]
    }

    /** 角色权限配置 */
    interface RolePermissions {
      menuIds: number[]
      permissionIds: number[]
    }

    /** 更新角色权限参数 */
    interface UpdateRolePermissionsParams {
      menuIds: number[]
      permissionIds: number[]
    }

    /** 菜单元数据 */
    interface MenuMeta {
      title: string
      icon?: string
      isHide?: boolean
      isHideTab?: boolean
      keepAlive?: boolean
      link?: string
      isIframe?: boolean
      isFullPage?: boolean
      fixedTab?: boolean
      activePath?: string
      showBadge?: boolean
      showTextBadge?: string
      authList?: AuthItem[]
    }

    /** 按钮权限项 */
    interface AuthItem {
      id: number
      title: string
      authMark: string
    }

    /** 创建菜单参数 */
    interface CreateMenuParams {
      parentId?: number
      name: string
      path: string
      component?: string
      meta: MenuMeta
      sortOrder?: number
    }

    /** 更新菜单参数 */
    interface UpdateMenuParams {
      parentId?: number
      name?: string
      path?: string
      component?: string
      meta?: Partial<MenuMeta>
      sortOrder?: number
    }

    /** 创建按钮权限参数 */
    interface CreateButtonPermissionParams {
      menuId: number
      permissionName: string
      permissionCode: string
      description?: string
      sortOrder?: number
    }

    /** 更新按钮权限参数 */
    interface UpdateButtonPermissionParams {
      permissionName?: string
      permissionCode?: string
      description?: string
      sortOrder?: number
    }
  }
}
