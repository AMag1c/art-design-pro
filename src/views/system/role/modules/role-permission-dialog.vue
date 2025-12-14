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
        check-strictly
        node-key="key"
        :default-expand-all="isExpandAll"
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
   * 使用若依的设计：菜单和权限独立控制，使用不同的 key 前缀
   */
  const processedMenuList = computed(() => {
    const processNode = (node: MenuNode): MenuNode => {
      const processed = {
        ...node,
        key: `menu_${node.id}` // 菜单节点使用 menu_ 前缀
      }

      // 先递归处理子菜单节点
      if (node.children && node.children.length > 0) {
        processed.children = node.children.map(processNode)
      }

      // 如果有 authList，将其作为子节点添加
      if (node.meta?.authList?.length) {
        const authNodes = node.meta.authList.map((auth) => ({
          id: auth.id,
          key: `perm_${auth.id}`, // 权限节点使用 perm_ 前缀
          name: `${node.name}_${auth.authMark}`,
          label: auth.title,
          authMark: auth.authMark,
          permissionId: auth.id,
          isAuth: true
        }))

        // 将权限节点追加到 children（子菜单 + 权限节点）
        if (processed.children) {
          processed.children = [...processed.children, ...authNodes]
        } else {
          processed.children = authNodes
        }
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
   * 使用若依的设计：菜单和权限独立设置，使用不同的 key 前缀
   */
  const loadRolePermissions = async () => {
    if (!props.roleData) return

    try {
      const res = await fetchGetRolePermissions(props.roleData.roleId)

      // 收集要选中的 keys（菜单 + 权限）
      const checkedKeys: string[] = []

      // 添加选中的菜单（使用 menu_ 前缀）
      if (res.menuIds && res.menuIds.length > 0) {
        res.menuIds.forEach((menuId: number) => {
          checkedKeys.push(`menu_${menuId}`)
        })
      }

      // 添加选中的权限（使用 perm_ 前缀）
      if (res.permissionIds && res.permissionIds.length > 0) {
        res.permissionIds.forEach((permId: number) => {
          checkedKeys.push(`perm_${permId}`)
        })
      }

      // 等待DOM更新后设置选中状态
      await nextTick()

      // 先清空之前的选中状态
      treeRef.value?.setCheckedKeys([])

      // 再设置新的选中状态
      if (checkedKeys.length > 0) {
        treeRef.value?.setCheckedKeys(checkedKeys, false)
      }
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
   * 使用若依的设计：从 key 前缀区分菜单和权限
   */
  const savePermission = async () => {
    if (!props.roleData) return

    try {
      // 获取所有选中的节点（包括全选和半选）
      const checkedKeys = treeRef.value?.getCheckedKeys() || []
      const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []

      // 合并选中和半选的 keys
      const allKeys = [...checkedKeys, ...halfCheckedKeys]

      // 分离菜单ID和权限ID
      const menuIds: number[] = []
      const permissionIds: number[] = []

      allKeys.forEach((key: any) => {
        const keyStr = String(key)
        if (keyStr.startsWith('menu_')) {
          // 菜单节点：提取菜单ID
          const menuId = parseInt(keyStr.replace('menu_', ''))
          if (!isNaN(menuId)) {
            menuIds.push(menuId)
          }
        } else if (keyStr.startsWith('perm_')) {
          // 权限节点：提取权限ID
          const permId = parseInt(keyStr.replace('perm_', ''))
          if (!isNaN(permId)) {
            permissionIds.push(permId)
          }
        }
      })

      // 去重
      const uniqueMenuIds = Array.from(new Set(menuIds))
      const uniquePermissionIds = Array.from(new Set(permissionIds))

      // 如果菜单和权限都为空，提示用户
      if (uniqueMenuIds.length === 0 && uniquePermissionIds.length === 0) {
        ElMessage.warning('请至少选择一个菜单或权限')
        return
      }

      // 调用保存权限接口
      await fetchUpdateRolePermissions(props.roleData.roleId, {
        menuIds: uniqueMenuIds,
        permissionIds: uniquePermissionIds
      })

      ElMessage.success('权限配置成功，相关用户需重新登录后生效')

      emit('success')
      handleClose()
    } catch (error) {
      console.error('保存权限失败:', error)
      ElMessage.error('保存权限失败')
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
   * 递归获取所有节点的 key（使用新的 key 格式）
   * @param nodes 节点列表
   * @returns 所有节点的 key 数组
   */
  const getAllNodeKeys = (nodes: MenuNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: MenuNode[]): void => {
      nodeList.forEach((node) => {
        if (node.key) keys.push(node.key)
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

    ElMessage.success(`已输出选中数据到控制台，共选中 ${selectedData.totalChecked} 个节点`)
  }
</script>
