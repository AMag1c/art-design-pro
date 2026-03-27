<!-- 游戏管理页面 -->
<template>
  <div class="game-store-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'add'" @click="showDialog('add')" v-ripple type="primary">
              <ElIcon><Plus /></ElIcon>
              新增游戏
            </ElButton>
            <ElButton
              v-auth="'delete'"
              @click="handleBatchDelete"
              :disabled="selectedRows.length === 0"
              v-ripple
            >
              <ElIcon><Delete /></ElIcon>
              批量删除 ({{ selectedRows.length }})
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 游戏弹窗 -->
      <GameDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :game-data="currentGameData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { SearchFormItem as FormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchAdminGetGameItems,
    fetchAdminGetGameCategories,
    fetchDeleteGameItem,
    fetchUpdateGameItem,
    type GameItem,
    type GameCategory
  } from '@/api/shop-manage'
  import GameDialog from './modules/game-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage, ElImage, ElIcon } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { DialogType } from '@/types'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'GameStoreManage' })

  const { hasAuth } = useAuth()

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentGameData = ref<Partial<GameItem>>({})

  // 选中行
  const selectedRows = ref<GameItem[]>([])

  // 游戏分类列表（用于搜索下拉）
  const categories = ref<GameCategory[]>([])
  onMounted(async () => {
    try {
      const res = await fetchAdminGetGameCategories()
      categories.value = ((res as any).list ?? res ?? []) as GameCategory[]
    } catch {
      categories.value = []
    }
  })

  // 搜索表单
  const searchForm = ref({
    keyword: undefined as string | undefined,
    categoryId: undefined as number | undefined,
    status: undefined as string | undefined
  })

  const searchItems = computed<FormItem[]>(() => [
    {
      key: 'keyword',
      label: '游戏名称',
      type: 'input',
      props: { placeholder: '请输入游戏名称', clearable: true }
    },
    {
      key: 'categoryId',
      label: '分类',
      type: 'select',
      props: {
        placeholder: '请选择游戏分类',
        clearable: true,
        options: categories.value.map((c) => ({ label: c.name, value: c.id }))
      }
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '已上架', value: 'on_sale' },
          { label: '已下架', value: 'off_sale' }
        ]
      }
    }
  ])

  // 状态配置
  const STATUS_CONFIG = {
    on_sale: { type: 'success' as const, text: '已上架' },
    off_sale: { type: 'danger' as const, text: '已下架' }
  } as const

  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { type: 'info' as const, text: '未知' }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchAdminGetGameItems,
      apiParams: {
        current: 1,
        size: 20,
        keyword: searchForm.value.keyword,
        categoryId: searchForm.value.categoryId,
        status: searchForm.value.status
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', label: '序号', width: 80 },
        {
          prop: 'coverImage',
          label: '封面',
          width: 70,
          formatter: (row: GameItem) =>
            row.coverImage
              ? h(ElImage, {
                  class: 'w-11 h-11 rounded-lg object-cover',
                  src: row.coverImage,
                  previewSrcList: [row.coverImage],
                  previewTeleported: true
                })
              : h(
                  'div',
                  {
                    class:
                      'w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400'
                  },
                  '无图'
                )
        },
        { prop: 'name', label: '游戏名称', minWidth: 160 },
        {
          prop: 'nameEn',
          label: '英文名',
          width: 150,
          formatter: (row: GameItem) => row.nameEn || '-'
        },
        {
          prop: 'category',
          label: '分类',
          width: 120,
          formatter: (row: GameItem) =>
            row.category
              ? h(ElTag, { type: 'info', size: 'small' }, () => row.category)
              : h('span', { class: 'text-gray-400 text-xs' }, '未分类')
        },
        {
          prop: 'price',
          label: '价格',
          width: 100,
          formatter: (row: GameItem) =>
            row.price > 0 ? `¥${(row.price / 100).toFixed(2)}` : '免费'
        },
        {
          prop: 'rating',
          label: '评分',
          width: 80,
          formatter: (row: GameItem) => (row.rating > 0 ? row.rating.toFixed(1) : '-')
        },
        { prop: 'downloads', label: '下载量', width: 90 },
        { prop: 'views', label: '浏览量', width: 90 },
        {
          prop: 'isFeatured',
          label: '精选',
          width: 80,
          formatter: (row: GameItem) =>
            row.isFeatured
              ? h(ElTag, { type: 'warning', size: 'small' }, () => '精选')
              : h(ElTag, { type: 'info', size: 'small' }, () => '普通')
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: GameItem) => {
            const config = getStatusConfig(row.status)
            return h(ElTag, { type: config.type }, () => config.text)
          }
        },
        { prop: 'updateTime', label: '更新时间', width: 180 },
        {
          prop: 'action',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: (row: GameItem) =>
            h('div', { style: 'text-align: right' }, [
              hasAuth('edit')
                ? h(ArtButtonTable, {
                    type: 'edit',
                    title: '编辑',
                    onClick: () => showDialog('edit', row)
                  })
                : null,
              hasAuth('edit')
                ? h(ArtButtonTable, {
                    icon:
                      row.status === 'on_sale'
                        ? 'ri:arrow-down-circle-line'
                        : 'ri:arrow-up-circle-line',
                    iconClass:
                      row.status === 'on_sale'
                        ? 'bg-warning/12 text-warning'
                        : 'bg-success/12 text-success',
                    title: row.status === 'on_sale' ? '下架' : '上架',
                    onClick: () => handleToggleStatus(row)
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
      ]
    }
  })

  /**
   * 搜索
   */
  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  /**
   * 重置
   */
  const handleReset = () => {
    resetSearchParams()
  }

  /**
   * 处理选中行变化
   */
  const handleSelectionChange = (rows: GameItem[]) => {
    selectedRows.value = rows
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, gameData?: GameItem) => {
    dialogType.value = type
    currentGameData.value = gameData ? { ...gameData } : {}
    dialogVisible.value = true
  }

  /**
   * 弹窗提交成功
   */
  const handleDialogSubmit = () => {
    if (dialogType.value === 'add') {
      refreshCreate()
    } else {
      refreshUpdate()
    }
  }

  /**
   * 切换状态
   */
  const handleToggleStatus = async (row: GameItem) => {
    const newStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
    const action = newStatus === 'on_sale' ? '上架' : '下架'
    try {
      await ElMessageBox.confirm(`确定要${action}游戏「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchUpdateGameItem(row.id, { status: newStatus })
      ElMessage.success(`${action}成功`)
      refreshUpdate()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('操作失败')
      }
    }
  }

  /**
   * 删除游戏
   */
  const handleDelete = async (row: GameItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除游戏「${row.name}」吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchDeleteGameItem(row.id)
      ElMessage.success('删除成功')
      refreshRemove()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的游戏')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个游戏吗？此操作不可恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      )
      await Promise.all(selectedRows.value.map((row) => fetchDeleteGameItem(row.id)))
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      refreshRemove()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .game-store-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
