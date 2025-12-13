<!-- 游戏商店管理页面 -->
<template>
  <div class="game-store-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard shadow="never">
      <ArtForm
        ref="searchFormRef"
        :model="searchForm"
        :columns="searchColumns"
        :label-width="80"
        :col-span="6"
      >
        <template #action>
          <ElButton type="primary" @click="handleSearch" v-ripple>
            <template #icon>
              <SvgIcon name="ri:search-line" />
            </template>
            搜索
          </ElButton>
          <ElButton @click="handleReset" v-ripple>
            <template #icon>
              <SvgIcon name="ri:refresh-line" />
            </template>
            重置
          </ElButton>
        </template>
      </ArtForm>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple type="primary">
              <template #icon>
                <SvgIcon name="ri:add-line" />
              </template>
              新增游戏
            </ElButton>
            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <template #icon>
                <SvgIcon name="ri:delete-bin-line" />
              </template>
              批量删除
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
  import { useTable } from '@/hooks/core/useTable'
  import GameDialog from './modules/game-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType, ArtFormColumn } from '@/types'

  defineOptions({ name: 'GameStoreManage' })

  // 游戏数据类型
  interface GameListItem {
    id: string
    name: string
    platform: string
    category: string
    status: 'published' | 'draft' | 'unpublished'
    price: number
    originalPrice?: number
    stock: number
    soldCount: number
    rating: number
    reviewCount: number
    isHot: boolean
    isFeatured: boolean
    createdAt: string
    updatedAt: string
  }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentGameData = ref<Partial<GameListItem>>({})

  // 选中行
  const selectedRows = ref<GameListItem[]>([])

  // 搜索表单
  const searchFormRef = ref()
  const searchForm = ref({
    name: undefined,
    platform: undefined,
    category: undefined,
    status: undefined
  })

  const searchColumns: ArtFormColumn[] = [
    {
      prop: 'name',
      label: '游戏名称',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入游戏名称',
        clearable: true
      }
    },
    {
      prop: 'platform',
      label: '平台',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择平台',
        clearable: true
      },
      options: [
        { label: 'Steam', value: 'steam' },
        { label: 'Epic', value: 'epic' },
        { label: 'Origin', value: 'origin' },
        { label: 'PlayStation', value: 'playstation' },
        { label: 'Xbox', value: 'xbox' }
      ]
    },
    {
      prop: 'category',
      label: '分类',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择分类',
        clearable: true
      },
      options: [
        { label: '动作', value: 'action' },
        { label: '冒险', value: 'adventure' },
        { label: 'RPG', value: 'rpg' },
        { label: '射击', value: 'shooter' },
        { label: '策略', value: 'strategy' }
      ]
    },
    {
      prop: 'status',
      label: '状态',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择状态',
        clearable: true
      },
      options: [
        { label: '已上架', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '已下架', value: 'unpublished' }
      ]
    }
  ]

  // 状态配置
  const STATUS_CONFIG = {
    published: { type: 'success' as const, text: '已上架' },
    draft: { type: 'info' as const, text: '草稿' },
    unpublished: { type: 'danger' as const, text: '已下架' }
  } as const

  /**
   * 获取状态配置
   */
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
    handleSearch: onSearch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange: onSelectionChange,
    refreshData,
    resetSearchParams
  } = useTable<GameListItem>({
    // 模拟API请求
    apiFn: async () => {
      // 模拟数据
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData: GameListItem[] = [
            {
              id: '1',
              name: '赛博朋克2077',
              platform: 'steam',
              category: 'rpg',
              status: 'published',
              price: 29800,
              originalPrice: 39800,
              stock: 50,
              soldCount: 234,
              rating: 4.5,
              reviewCount: 1234,
              isHot: true,
              isFeatured: true,
              createdAt: '2024-11-01',
              updatedAt: '2024-12-05'
            },
            {
              id: '2',
              name: '艾尔登法环',
              platform: 'steam',
              category: 'action',
              status: 'published',
              price: 39800,
              stock: 100,
              soldCount: 567,
              rating: 4.9,
              reviewCount: 2345,
              isHot: true,
              isFeatured: true,
              createdAt: '2024-10-15',
              updatedAt: '2024-12-03'
            },
            {
              id: '3',
              name: 'GTA5',
              platform: 'epic',
              category: 'action',
              status: 'published',
              price: 19800,
              stock: -1,
              soldCount: 892,
              rating: 4.7,
              reviewCount: 3456,
              isHot: true,
              isFeatured: false,
              createdAt: '2024-09-20',
              updatedAt: '2024-12-01'
            }
          ]

          resolve({
            data: {
              list: mockData,
              total: mockData.length
            }
          })
        }, 500)
      })
    },
    columns: [
      { type: 'selection', width: 55 },
      { type: 'index', label: '序号', width: 80 },
      { prop: 'name', label: '游戏名称', minWidth: 200 },
      { prop: 'platform', label: '平台', width: 120 },
      { prop: 'category', label: '分类', width: 100 },
      {
        prop: 'price',
        label: '价格',
        width: 120,
        formatter: (row: GameListItem) => {
          return `¥${(row.price / 100).toFixed(2)}`
        }
      },
      {
        prop: 'stock',
        label: '库存',
        width: 100,
        formatter: (row: GameListItem) => {
          return row.stock === -1 ? '无限' : row.stock.toString()
        }
      },
      { prop: 'soldCount', label: '销量', width: 100 },
      {
        prop: 'rating',
        label: '评分',
        width: 100,
        formatter: (row: GameListItem) => {
          return `${row.rating} (${row.reviewCount})`
        }
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: GameListItem) => {
          const config = getStatusConfig(row.status)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      { prop: 'updatedAt', label: '更新时间', width: 120 },
      {
        prop: 'action',
        label: '操作',
        width: 220,
        fixed: 'right',
        formatter: (row: GameListItem) => {
          return h(ArtButtonTable, {
            buttons: [
              {
                text: '编辑',
                type: 'primary',
                link: true,
                onClick: () => showDialog('edit', row)
              },
              {
                text: row.status === 'published' ? '下架' : '上架',
                type: row.status === 'published' ? 'warning' : 'success',
                link: true,
                onClick: () => handleToggleStatus(row)
              },
              {
                text: '删除',
                type: 'danger',
                link: true,
                onClick: () => handleDelete(row)
              }
            ]
          })
        }
      }
    ],
    searchParams: searchForm.value
  })

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    onSearch()
  }

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchFormRef.value?.resetFields()
    resetSearchParams()
  }

  /**
   * 处理选中行变化
   */
  const handleSelectionChange = (rows: GameListItem[]) => {
    selectedRows.value = rows
    onSelectionChange(rows)
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, gameData?: GameListItem) => {
    dialogType.value = type
    currentGameData.value = gameData ? { ...gameData } : {}
    dialogVisible.value = true
  }

  /**
   * 处理弹窗提交
   */
  const handleDialogSubmit = async () => {
    try {
      if (dialogType.value === 'add') {
        ElMessage.success('新增游戏成功')
      } else {
        ElMessage.success('编辑游戏成功')
      }
      dialogVisible.value = false
      refreshData()
    } catch {
      ElMessage.error('操作失败')
    }
  }

  /**
   * 切换游戏状态
   */
  const handleToggleStatus = async (row: GameListItem) => {
    const action = row.status === 'published' ? '下架' : '上架'
    try {
      await ElMessageBox.confirm(`确定要${action}游戏 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      ElMessage.success(`${action}成功`)
      refreshData()
    } catch {
      // 用户取消
    }
  }

  /**
   * 删除游戏
   */
  const handleDelete = async (row: GameListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除游戏 ${row.name} 吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      ElMessage.success('删除成功')
      refreshData()
    } catch {
      // 用户取消
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
      ElMessage.success('批量删除成功')
      refreshData()
    } catch {
      // 用户取消
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
