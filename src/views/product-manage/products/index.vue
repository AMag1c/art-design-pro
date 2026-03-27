<!-- MagicShop 商品管理页面 -->
<template>
  <div class="magicshop-products-page art-full-height">
    <!-- 搜索栏 -->
    <ProductSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'add'" @click="showDialog('add')" v-ripple type="primary">
              <ElIcon><Plus /></ElIcon>
              新增商品
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

      <!-- 商品弹窗 -->
      <ProductDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :product-data="currentProductData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchAdminGetProducts, fetchDeleteProduct, fetchUpdateProduct } from '@/api/shop-manage'
  import type { ProductItem } from '@/api/shop-manage'
  import ProductSearch from './modules/product-search.vue'
  import ProductDialog from './modules/product-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage, ElImage, ElIcon } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import { DialogType } from '@/types'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'MagicShopProducts' })

  const { hasAuth } = useAuth()

  type ProductListItem = ProductItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentProductData = ref<Partial<ProductListItem>>({})

  // 选中行
  const selectedRows = ref<ProductListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    keyword: undefined as string | undefined,
    categoryId: undefined as number | undefined,
    status: undefined as string | undefined
  })

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
      apiFn: fetchAdminGetProducts,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', label: '序号', width: 80 },
        {
          prop: 'coverImage',
          label: '封面',
          width: 70,
          formatter: (row: ProductListItem) =>
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
        { prop: 'name', label: '商品名称', minWidth: 160 },
        {
          prop: 'category',
          label: '分类',
          width: 120,
          formatter: (row: ProductListItem) => row.category?.name || '-'
        },
        {
          prop: 'price',
          label: '价格',
          width: 120,
          formatter: (row: ProductListItem) => `¥${(row.price / 100).toFixed(2)}`
        },
        {
          prop: 'stock',
          label: '库存',
          width: 90,
          formatter: (row: ProductListItem) => row.stock.toString()
        },
        { prop: 'soldCount', label: '销量', width: 90 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: ProductListItem) => {
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
          formatter: (row: ProductListItem) =>
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
  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 处理选中行变化
   */
  const handleSelectionChange = (rows: ProductListItem[]) => {
    selectedRows.value = rows
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, productData?: ProductListItem) => {
    dialogType.value = type
    currentProductData.value = productData ? { ...productData } : {}
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
   * 切换商品状态
   */
  const handleToggleStatus = async (row: ProductListItem) => {
    const newStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
    const action = newStatus === 'on_sale' ? '上架' : '下架'
    try {
      await ElMessageBox.confirm(`确定要${action}商品「${row.name}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchUpdateProduct(row.id, { status: newStatus })
      ElMessage.success(`${action}成功`)
      refreshUpdate()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('操作失败')
      }
    }
  }

  /**
   * 删除商品
   */
  const handleDelete = async (row: ProductListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除商品「${row.name}」吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchDeleteProduct(row.id)
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
      ElMessage.warning('请先选择要删除的商品')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个商品吗？此操作不可恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      )
      await Promise.all(selectedRows.value.map((row) => fetchDeleteProduct(row.id)))
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
  .magicshop-products-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
