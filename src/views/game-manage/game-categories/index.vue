<!-- 游戏分类管理 -->
<template>
  <div class="game-categories-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="loadList">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'add'" @click="showDialog('add')" v-ripple type="primary">
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
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="filteredList"
        :columns="columns"
        :pagination="false"
        @selection-change="handleSelectionChange"
      />

      <GameCategoryDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :category-data="currentCategoryData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { SearchFormItem as FormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import {
    fetchAdminGetGameCategories,
    fetchUpdateGameCategory,
    fetchDeleteGameCategory,
    type GameCategory
  } from '@/api/shop-manage'
  import GameCategoryDialog from './modules/category-dialog.vue'
  import { ElTag, ElSwitch, ElMessageBox, ElMessage, ElIcon, ElSpace } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { DialogType } from '@/types'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'GameCategoriesManage' })

  const { hasAuth } = useAuth()

  const loading = ref(false)
  const list = ref<GameCategory[]>([])
  const selectedRows = ref<GameCategory[]>([])

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentCategoryData = ref<Partial<GameCategory>>({})

  // 搜索表单（绑定到 ArtSearchBar）
  const searchForm = ref<Record<string, any>>({
    keyword: undefined,
    enabled: undefined
  })

  // 已提交的搜索条件（点击"查询"后生效）
  const appliedSearch = ref({ keyword: '', enabled: undefined as boolean | undefined })

  const searchItems = computed<FormItem[]>(() => [
    {
      key: 'keyword',
      label: '分类名称',
      type: 'input',
      props: { placeholder: '请输入分类名称或英文名', clearable: true }
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

  // 客户端过滤（分类数量少，无需服务端分页）
  const filteredList = computed(() => {
    let result = list.value
    const { keyword, enabled } = appliedSearch.value
    if (keyword) {
      const kw = keyword.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(kw) || (item.nameEn?.toLowerCase().includes(kw) ?? false)
      )
    }
    if (enabled !== undefined && enabled !== null) {
      result = result.filter((item) => item.enabled === enabled)
    }
    return result
  })

  const loadList = async () => {
    loading.value = true
    try {
      list.value = ((await fetchAdminGetGameCategories()) as any) || []
    } catch {
      list.value = []
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

  const handleSelectionChange = (rows: GameCategory[]) => {
    selectedRows.value = rows
  }

  const { columnChecks, columns } = useTableColumns(() => [
    { type: 'selection' },
    { type: 'index', label: '序号', width: 70 },
    { prop: 'name', label: '分类名称', minWidth: 120 },
    {
      prop: 'nameEn',
      label: '英文名',
      minWidth: 160,
      formatter: (row: GameCategory) => row.nameEn || '-'
    },
    {
      prop: 'icon',
      label: '图标',
      width: 120,
      formatter: (row: GameCategory) =>
        row.icon
          ? h(ElTag, { type: 'info', size: 'small' }, () => row.icon)
          : h('span', { class: 'text-gray-400 text-xs' }, '-')
    },
    { prop: 'sortOrder', label: '排序', width: 80 },
    {
      prop: 'enabled',
      label: '状态',
      width: 100,
      formatter: (row: GameCategory) =>
        h(ElSwitch, {
          modelValue: row.enabled,
          size: 'small',
          disabled: !hasAuth('edit'),
          onChange: (val: boolean) => handleToggleEnabled(row, val)
        })
    },
    { prop: 'createTime', label: '创建时间', width: 180 },
    {
      prop: 'action',
      label: '操作',
      width: 120,
      fixed: 'right',
      formatter: (row: GameCategory) =>
        h('div', { style: 'text-align: right' }, [
          hasAuth('edit')
            ? h(ArtButtonTable, {
                type: 'edit',
                title: '编辑',
                onClick: () => showDialog('edit', row)
              })
            : null,
          hasAuth('delete')
            ? h(ArtButtonTable, {
                type: 'delete',
                title: '删除',
                onClick: () => handleDelete(row)
              })
            : null
        ])
    }
  ])

  const showDialog = (type: DialogType, cat?: GameCategory) => {
    dialogType.value = type
    currentCategoryData.value = cat ? { ...cat } : {}
    dialogVisible.value = true
  }

  const handleDialogSubmit = () => {
    loadList()
  }

  const handleToggleEnabled = async (row: GameCategory, val: boolean) => {
    const prev = row.enabled
    row.enabled = val // 乐观更新
    try {
      await fetchUpdateGameCategory(row.id, { enabled: val })
      ElMessage.success(val ? '已启用' : '已禁用')
    } catch {
      row.enabled = prev // 回滚
      ElMessage.error('操作失败')
    }
  }

  const handleDelete = async (row: GameCategory) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除分类「${row.name}」吗？删除后该分类下的游戏将显示为未分类。`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'error' }
      )
      await fetchDeleteGameCategory(row.id)
      ElMessage.success('删除成功')
      await loadList()
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) return
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个分类吗？删除后相关游戏将显示为未分类。`,
        '警告',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'error' }
      )
      await Promise.all(selectedRows.value.map((row) => fetchDeleteGameCategory(row.id)))
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await loadList()
    } catch (error) {
      if (error !== 'cancel') ElMessage.error('删除失败')
    }
  }
</script>

<style lang="scss" scoped>
  .game-categories-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
