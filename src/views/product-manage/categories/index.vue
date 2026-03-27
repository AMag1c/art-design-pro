<!-- 商品分类管理 -->
<template>
  <div class="categories-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" v-model:columns="columnChecks" @refresh="loadList">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'add'" type="primary" @click="showDialog('add', null)" v-ripple>
              <ElIcon><Plus /></ElIcon>
              新增分类
            </ElButton>
            <ElButton
              v-auth="'delete'"
              v-ripple
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              <ElIcon><Delete /></ElIcon>
              批量删除 ({{ selectedRows.length }})
            </ElButton>
            <ElButton v-ripple @click="toggleExpand">
              {{ isExpanded ? '收起全部' : '展开全部' }}
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="displayData"
        :columns="columns"
        :stripe="false"
        :tree-props="{ children: 'children' }"
        :default-expand-all="true"
        @selection-change="handleSelectionChange"
      />

      <CategoryDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :row-data="currentRow"
        @submit="loadList"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { SearchFormItem as FormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import {
    fetchAdminGetCategories,
    fetchUpdateCategory,
    fetchDeleteCategory,
    type CategoryItem
  } from '@/api/shop-manage'
  import CategoryDialog from './modules/category-dialog.vue'
  import { ElSwitch, ElMessageBox, ElMessage, ElIcon, ElSpace } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'ShopCategories' })

  const { hasAuth } = useAuth()

  type CategoryTreeItem = CategoryItem & { children?: CategoryTreeItem[] }

  const loading = ref(false)
  const rawList = ref<CategoryItem[]>([])
  const isExpanded = ref(true)
  const tableRef = ref()
  const selectedRows = ref<CategoryTreeItem[]>([])

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRow = ref<CategoryTreeItem | null>(null)

  // 搜索表单
  const searchForm = ref<Record<string, any>>({
    keyword: undefined,
    enabled: undefined
  })
  const appliedSearch = ref({ keyword: '', enabled: undefined as boolean | undefined })

  const searchItems = computed<FormItem[]>(() => [
    {
      key: 'keyword',
      label: '分类名称',
      type: 'input',
      props: { placeholder: '请输入分类名称', clearable: true }
    },
    {
      key: 'enabled',
      label: '状态',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '已启用', value: true },
          { label: '已禁用', value: false }
        ]
      }
    }
  ])

  /**
   * 构建树形结构
   */
  const buildTree = (list: CategoryItem[]): CategoryTreeItem[] => {
    const map = new Map<number, CategoryTreeItem>()
    const roots: CategoryTreeItem[] = []

    list.forEach((item) => map.set(item.id, { ...item }))
    list.forEach((item) => {
      const node = map.get(item.id)!
      if (!item.parentId) {
        roots.push(node)
      } else {
        const parent = map.get(item.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      }
    })

    const sortItems = (items: CategoryTreeItem[]) => {
      items.sort((a, b) => a.sortOrder - b.sortOrder)
      items.forEach((item) => item.children?.length && sortItems(item.children))
    }
    sortItems(roots)
    return roots
  }

  const treeData = computed(() => buildTree(rawList.value))

  /**
   * 树形过滤：节点自身匹配时显示完整子树，仅后代匹配时作为容器展示
   */
  const filterTree = (
    nodes: CategoryTreeItem[],
    kw: string,
    en: boolean | undefined
  ): CategoryTreeItem[] => {
    const result: CategoryTreeItem[] = []
    for (const node of nodes) {
      const nameOk = !kw || node.name.toLowerCase().includes(kw.toLowerCase())
      const statusOk = en === undefined || en === null || node.enabled === en
      const selfMatch = nameOk && statusOk
      const filteredChildren = filterTree(node.children || [], kw, en)

      if (selfMatch) {
        // 自身匹配：保留完整子树，提供上下文
        result.push({ ...node })
      } else if (filteredChildren.length > 0) {
        // 后代匹配：作为容器展示，只显示匹配的子节点
        result.push({ ...node, children: filteredChildren })
      }
    }
    return result
  }

  const isFiltering = computed(
    () => !!(appliedSearch.value.keyword || appliedSearch.value.enabled !== undefined)
  )

  const displayData = computed(() =>
    isFiltering.value
      ? filterTree(treeData.value, appliedSearch.value.keyword, appliedSearch.value.enabled)
      : treeData.value
  )

  const loadList = async () => {
    loading.value = true
    try {
      rawList.value = ((await fetchAdminGetCategories()) as any) || []
    } catch {
      rawList.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(loadList)

  const handleSearch = () => {
    appliedSearch.value = {
      keyword: searchForm.value.keyword ?? '',
      enabled: searchForm.value.enabled
    }
  }

  const handleReset = () => {
    appliedSearch.value = { keyword: '', enabled: undefined }
  }

  const handleSelectionChange = (rows: CategoryTreeItem[]) => {
    selectedRows.value = rows
  }

  const showDialog = (type: 'add' | 'edit', row: CategoryTreeItem | null) => {
    dialogType.value = type
    currentRow.value = row
    dialogVisible.value = true
  }

  const handleToggleEnabled = async (row: CategoryTreeItem, enabled: boolean) => {
    const prev = row.enabled
    row.enabled = enabled // 乐观更新
    try {
      await fetchUpdateCategory(row.id, { enabled })
      ElMessage.success(enabled ? '已启用' : '已禁用')
    } catch {
      row.enabled = prev // 回滚
      ElMessage.error('操作失败')
    }
  }

  const handleDelete = async (row: CategoryTreeItem) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除分类「${row.name}」吗？若该分类下有商品将无法删除。`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )
      await fetchDeleteCategory(row.id)
      ElMessage.success('删除成功')
      await loadList()
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) return

    // 预检查：含子分类的节点不能删除
    const withChildren = selectedRows.value.filter((r) => r.children?.length)
    if (withChildren.length > 0) {
      ElMessage.warning(
        `以下分类含子分类，请先删除子分类：${withChildren.map((r) => r.name).join('、')}`
      )
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个分类吗？有关联商品的分类将无法删除。`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'error' }
      )
      await Promise.all(selectedRows.value.map((row) => fetchDeleteCategory(row.id)))
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await loadList()
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败，部分分类可能存在关联商品')
    }
  }

  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'selection' },
    { type: 'index', label: '序号', width: 60 },
    { prop: 'name', label: '分类名称', minWidth: 160 },
    {
      prop: 'description',
      label: '描述',
      minWidth: 150,
      formatter: (row: CategoryTreeItem) => row.description || '-'
    },
    { prop: 'sortOrder', label: '排序', width: 80 },
    {
      prop: 'enabled',
      label: '状态',
      width: 90,
      formatter: (row: CategoryTreeItem) =>
        h(ElSwitch, {
          modelValue: row.enabled,
          disabled: !hasAuth('edit'),
          onChange: (val: boolean) => handleToggleEnabled(row, val)
        })
    },
    { prop: 'updateTime', label: '更新时间', width: 180 },
    {
      prop: 'operation',
      label: '操作',
      width: 160,
      align: 'right',
      formatter: (row: CategoryTreeItem) =>
        h('div', { style: 'text-align: right' }, [
          hasAuth('add')
            ? h(ArtButtonTable, {
                type: 'add',
                title: '新增子分类',
                onClick: () => showDialog('add', row)
              })
            : null,
          hasAuth('edit')
            ? h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              })
            : null,
          hasAuth('delete')
            ? h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            : null
        ])
    }
  ])

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef) {
        const process = (rows: CategoryTreeItem[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              process(row.children)
            }
          })
        }
        process(treeData.value)
      }
    })
  }
</script>

<style lang="scss" scoped>
  .categories-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
