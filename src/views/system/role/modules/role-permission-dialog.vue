<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="520px"
    align-center
    class="el-dialog-border"
    @close="handleClose"
  >
    <ElScrollbar height="70vh">
      <ElTree
        ref="treeRef"
        :data="processedMenuList"
        show-checkbox
        node-key="name"
        :default-expand-all="isExpandAll"
        :default-checked-keys="[1, 2, 3]"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div style="display: flex; align-items: center">
            <span v-if="data.isAuth">
              {{ data.label }}
            </span>
            <span v-else>{{ defaultProps.label(data) }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>
    <template #footer>
      <ElButton @click="outputSelectedData" style="margin-left: 8px">获取选中数据</ElButton>

      <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
      <ElButton @click="toggleSelectAll" style="margin-left: 8px">{{
        isSelectAll ? '取消全选' : '全部选择'
      }}</ElButton>
      <ElButton type="primary" @click="savePermission">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { useMenuStore } from '@/store/modules/menu'
  import { formatMenuTitle } from '@/utils/router'
  import { fetchGetRolePermissions, fetchUpdateRolePermissions } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const { menuList } = storeToRefs(useMenuStore())
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)

  /**
   * 弹窗显示状态双向绑定
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * 菜单节点类型
   */
  interface MenuNode {
    id?: string | number
    name?: string
    label?: string
    meta?: {
      title?: string
      authList?: Array<{
        id?: number
        authMark: string
        title: string
        checked?: boolean
      }>
    }
    children?: MenuNode[]
    [key: string]: any
  }

  /**
   * 处理菜单数据，将 authList 转换为树形子节点
   * 递归处理菜单树，将权限列表展开为可选择的子节点
   */
  const processedMenuList = computed(() => {
    const processNode = (node: MenuNode): MenuNode => {
      const processed = { ...node }

      // 如果有 authList，将其转换为子节点
      if (node.meta?.authList?.length) {
        const authNodes = node.meta.authList.map((auth) => ({
          id: `${node.id}_${auth.authMark}`,
          name: `${node.name}_${auth.authMark}`,
          label: auth.title,
          authMark: auth.authMark,
          permissionId: auth.id, // 保存原始的权限ID
          isAuth: true,
          checked: auth.checked || false
        }))

        processed.children = processed.children ? [...processed.children, ...authNodes] : authNodes
      }

      // 递归处理子节点
      if (processed.children) {
        processed.children = processed.children.map(processNode)
      }

      return processed
    }

    return (menuList.value as any[]).map(processNode)
  })

  /**
   * 树形组件配置
   */
  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || data.label || ''
  }

  /**
   * 监听弹窗打开，初始化权限数据
   */
  watch(
    () => props.modelValue,
    async (newVal) => {
      if (newVal && props.roleData) {
        // 加载角色的权限数据
        await loadRolePermissions()
      }
    }
  )

  /**
   * 加载角色权限
   */
  const loadRolePermissions = async () => {
    if (!props.roleData) return

    try {
      const res = await fetchGetRolePermissions(props.roleData.roleId)

      // 设置选中的菜单和权限
      const checkedKeys: (string | number)[] = []

      // 从菜单列表中找到对应的菜单name
      const findMenuNames = (menus: any[], ids: number[]): string[] => {
        const names: string[] = []
        const traverse = (items: any[]) => {
          items.forEach((item) => {
            if (ids.includes(item.id)) {
              names.push(item.name)
            }
            if (item.children && item.children.length > 0) {
              traverse(item.children)
            }
          })
        }
        traverse(menus)
        return names
      }

      // 添加选中的菜单
      if (res.menuIds && res.menuIds.length > 0) {
        const menuNames = findMenuNames(menuList.value as any[], res.menuIds)
        checkedKeys.push(...menuNames)
      }

      // 添加选中的权限 - 需要根据权限ID找到对应的节点name
      if (res.permissionIds && res.permissionIds.length > 0) {
        const findPermissionKeys = (menus: any[], permIds: number[]): string[] => {
          const keys: string[] = []
          const traverse = (items: any[]) => {
            items.forEach((item) => {
              if (item.meta?.authList?.length) {
                item.meta.authList.forEach((auth: any) => {
                  if (permIds.includes(auth.id)) {
                    keys.push(`${item.name}_${auth.authMark}`)
                  }
                })
              }
              if (item.children && item.children.length > 0) {
                traverse(item.children)
              }
            })
          }
          traverse(menus)
          return keys
        }

        const permissionKeys = findPermissionKeys(menuList.value as any[], res.permissionIds)
        checkedKeys.push(...permissionKeys)
      }

      // 等待DOM更新后设置选中状态
      await nextTick()
      treeRef.value?.setCheckedKeys(checkedKeys, false)
    } catch (error) {
      console.error('加载角色权限失败:', error)
      ElMessage.error('加载权限失败')
    }
  }

  /**
   * 关闭弹窗并清空选中状态
   */
  const handleClose = () => {
    visible.value = false
    treeRef.value?.setCheckedKeys([])
  }

  /**
   * 保存权限配置
   */
  const savePermission = async () => {
    if (!props.roleData) return

    try {
      // 获取选中的节点
      const checkedNodes = treeRef.value?.getCheckedNodes() || []
      const halfCheckedNodes = treeRef.value?.getHalfCheckedNodes() || []

      // 分离菜单ID和权限ID
      const menuIds: number[] = []
      const permissionIds: number[] = []

      // 处理选中的节点
      checkedNodes.forEach((node: any) => {
        if (node.isAuth) {
          // 这是权限节点，使用 permissionId
          if (node.permissionId && typeof node.permissionId === 'number') {
            permissionIds.push(node.permissionId)
          }
        } else {
          // 这是菜单节点
          if (node.id && typeof node.id === 'number') {
            menuIds.push(node.id)
          }
        }
      })

      // 处理半选中的节点（父菜单）
      halfCheckedNodes.forEach((node: any) => {
        if (!node.isAuth && node.id && typeof node.id === 'number') {
          menuIds.push(node.id)
        }
      })

      // 去重
      const uniqueMenuIds = Array.from(new Set(menuIds))
      const uniquePermissionIds = Array.from(new Set(permissionIds))

      // 调用保存权限接口
      await fetchUpdateRolePermissions(props.roleData.roleId, {
        menuIds: uniqueMenuIds,
        permissionIds: uniquePermissionIds
      })

      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存权限失败:', error)
    }
  }

  /**
   * 切换全部展开/收起状态
   */
  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    const nodes = tree.store.nodesMap
    // 这里保留 any，因为 Element Plus 的内部节点类型较复杂
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  /**
   * 切换全选/取消全选状态
   */
  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      const allKeys = getAllNodeKeys(processedMenuList.value)
      tree.setCheckedKeys(allKeys)
    } else {
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  /**
   * 递归获取所有节点的 key
   * @param nodes 节点列表
   * @returns 所有节点的 key 数组
   */
  const getAllNodeKeys = (nodes: MenuNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: MenuNode[]): void => {
      nodeList.forEach((node) => {
        if (node.name) keys.push(node.name)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  /**
   * 处理树节点选中状态变化
   * 同步更新全选按钮状态
   */
  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys()
    const allKeys = getAllNodeKeys(processedMenuList.value)

    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }

  /**
   * 输出选中的权限数据到控制台
   * 用于调试和查看当前选中的权限配置
   */
  const outputSelectedData = () => {
    const tree = treeRef.value
    if (!tree) return

    const selectedData = {
      checkedKeys: tree.getCheckedKeys(),
      halfCheckedKeys: tree.getHalfCheckedKeys(),
      checkedNodes: tree.getCheckedNodes(),
      halfCheckedNodes: tree.getHalfCheckedNodes(),
      totalChecked: tree.getCheckedKeys().length,
      totalHalfChecked: tree.getHalfCheckedKeys().length
    }

    console.log('=== 选中的权限数据 ===', selectedData)
    ElMessage.success(`已输出选中数据到控制台，共选中 ${selectedData.totalChecked} 个节点`)
  }
</script>
