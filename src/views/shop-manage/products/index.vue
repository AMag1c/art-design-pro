<!-- MagicShop 商品管理页面 -->
<template>
  <div class="magicshop-products-page art-full-height">
    <!-- 搜索栏 -->
    <ProductSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></ProductSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple type="primary">
              <template #icon>
                <SvgIcon name="ri:add-line" />
              </template>
              新增商品
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
  import ProductSearch from './modules/product-search.vue'
  import ProductDialog from './modules/product-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'MagicShopProducts' })

  // 商品数据类型
  interface ProductListItem {
    id: string
    name: string
    type: string
    category: string
    status: 'published' | 'draft' | 'unpublished'
    price: number
    originalPrice?: number
    stock: number
    soldCount: number
    rating: number
    reviewCount: number
    deliveryType: 'auto' | 'manual'
    isHot: boolean
    isRecommended: boolean
    createdAt: string
    updatedAt: string
  }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentProductData = ref<Partial<ProductListItem>>({})

  // 选中行
  const selectedRows = ref<ProductListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    name: undefined,
    type: undefined,
    status: undefined,
    deliveryType: undefined
  })

  // 状态配置
  const STATUS_CONFIG = {
    published: { type: 'success' as const, text: '已上架' },
    draft: { type: 'info' as const, text: '草稿' },
    unpublished: { type: 'danger' as const, text: '已下架' }
  } as const

  // 发货方式配置
  const DELIVERY_CONFIG = {
    auto: { type: 'primary' as const, text: '自动发货' },
    manual: { type: 'warning' as const, text: '手动发货' }
  } as const

  /**
   * 获取状态配置
   */
  const getStatusConfig = (status: string) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || { type: 'info' as const, text: '未知' }
    )
  }

  /**
   * 获取发货方式配置
   */
  const getDeliveryConfig = (deliveryType: string) => {
    return (
      DELIVERY_CONFIG[deliveryType as keyof typeof DELIVERY_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange: onSelectionChange,
    refreshData,
    resetSearchParams
  } = useTable<ProductListItem>({
    // 模拟API请求
    apiFn: async () => {
      // 模拟数据
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData: ProductListItem[] = [
            {
              id: '1',
              name: '临时邮箱验证码服务',
              type: 'email_code',
              category: '邮箱接码',
              status: 'published',
              price: 99,
              stock: -1,
              soldCount: 543,
              rating: 4.7,
              reviewCount: 234,
              deliveryType: 'auto',
              isHot: true,
              isRecommended: false,
              createdAt: '2024-10-25',
              updatedAt: '2024-12-05'
            },
            {
              id: '2',
              name: '英雄联盟钻石账户',
              type: 'game_account',
              category: '游戏账户',
              status: 'published',
              price: 2999,
              originalPrice: 3999,
              stock: 8,
              soldCount: 127,
              rating: 4.8,
              reviewCount: 89,
              deliveryType: 'manual',
              isHot: true,
              isRecommended: true,
              createdAt: '2024-11-20',
              updatedAt: '2024-12-07'
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
      { prop: 'name', label: '商品名称', minWidth: 200 },
      { prop: 'category', label: '分类', width: 120 },
      {
        prop: 'price',
        label: '价格',
        width: 120,
        formatter: (row: ProductListItem) => {
          return `¥${(row.price / 100).toFixed(2)}`
        }
      },
      {
        prop: 'stock',
        label: '库存',
        width: 100,
        formatter: (row: ProductListItem) => {
          return row.stock === -1 ? '无限' : row.stock.toString()
        }
      },
      { prop: 'soldCount', label: '销量', width: 100 },
      {
        prop: 'rating',
        label: '评分',
        width: 100,
        formatter: (row: ProductListItem) => {
          return `${row.rating} (${row.reviewCount})`
        }
      },
      {
        prop: 'deliveryType',
        label: '发货方式',
        width: 100,
        formatter: (row: ProductListItem) => {
          const config = getDeliveryConfig(row.deliveryType)
          return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
        }
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: ProductListItem) => {
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
        formatter: (row: ProductListItem) => {
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
   * 处理选中行变化
   */
  const handleSelectionChange = (rows: ProductListItem[]) => {
    selectedRows.value = rows
    onSelectionChange(rows)
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
   * 处理弹窗提交
   */
  const handleDialogSubmit = async () => {
    try {
      if (dialogType.value === 'add') {
        ElMessage.success('新增商品成功')
      } else {
        ElMessage.success('编辑商品成功')
      }
      dialogVisible.value = false
      refreshData()
    } catch {
      ElMessage.error('操作失败')
    }
  }

  /**
   * 切换商品状态
   */
  const handleToggleStatus = async (row: ProductListItem) => {
    const action = row.status === 'published' ? '下架' : '上架'
    try {
      await ElMessageBox.confirm(`确定要${action}商品 ${row.name} 吗？`, '提示', {
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
   * 删除商品
   */
  const handleDelete = async (row: ProductListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除商品 ${row.name} 吗？此操作不可恢复！`, '警告', {
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
      ElMessage.success('批量删除成功')
      refreshData()
    } catch {
      // 用户取消
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
