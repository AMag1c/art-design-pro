<!-- 订单管理 -->
<template>
  <div class="orders-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <!-- 订单详情弹窗 -->
      <ElDialog v-model="detailVisible" title="订单详情" width="620px" destroy-on-close>
        <template v-if="currentOrder">
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="订单编号" :span="2">
              <span class="font-mono text-xs">{{ currentOrder.orderNo }}</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="用户ID">{{ currentOrder.userId }}</ElDescriptionsItem>
            <ElDescriptionsItem label="商品名称">
              {{ currentOrder.productSnapshot?.name || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="购买数量">{{ currentOrder.quantity }}</ElDescriptionsItem>
            <ElDescriptionsItem label="实付金额">
              ¥{{ (currentOrder.totalPrice / 100).toFixed(2) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="支付方式">
              {{ PAYMENT_LABEL[currentOrder.paymentMethod] || currentOrder.paymentMethod }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="订单状态">
              <ElTag :type="STATUS_CONFIG[currentOrder.status]?.type" size="small">
                {{ STATUS_CONFIG[currentOrder.status]?.text }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="下单时间">{{ currentOrder.createTime }}</ElDescriptionsItem>
            <ElDescriptionsItem label="支付时间">{{
              currentOrder.payTime || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem v-if="currentOrder.remark" label="买家备注" :span="2">
              {{ currentOrder.remark }}
            </ElDescriptionsItem>
          </ElDescriptions>

          <!-- 卡密列表 -->
          <div v-if="currentOrder.cardKeys?.length" class="mt-4">
            <div class="text-sm font-medium text-gray-700 mb-2">已发放卡密</div>
            <div
              v-for="key in currentOrder.cardKeys"
              :key="key.id"
              class="font-mono text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-1 select-all"
            >
              {{ key.content }}
            </div>
          </div>
          <ElEmpty
            v-else-if="['completed', 'paid'].includes(currentOrder.status)"
            description="暂无卡密"
            class="py-4"
          />
        </template>
        <template #footer>
          <ElButton @click="detailVisible = false">关闭</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { SearchFormItem as FormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchAdminGetOrders, type AdminOrderItem } from '@/api/shop-manage'
  import { ElTag, ElDialog, ElDescriptions, ElDescriptionsItem, ElEmpty } from 'element-plus'

  defineOptions({ name: 'AdminOrders' })

  const STATUS_CONFIG: Record<
    string,
    { type: 'info' | 'warning' | 'primary' | 'success' | 'danger'; text: string }
  > = {
    pending: { type: 'warning', text: '待支付' },
    paid: { type: 'primary', text: '已支付' },
    delivering: { type: 'primary', text: '发货中' },
    completed: { type: 'success', text: '已完成' },
    cancelled: { type: 'info', text: '已取消' },
    refunding: { type: 'danger', text: '退款中' },
    refunded: { type: 'info', text: '已退款' }
  }

  const PAYMENT_LABEL: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    balance: '余额支付'
  }

  const detailVisible = ref(false)
  const currentOrder = ref<AdminOrderItem | null>(null)

  const searchForm = ref({
    status: undefined as string | undefined
  })

  const searchItems = computed<FormItem[]>(() => [
    {
      key: 'status',
      label: '订单状态',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
          label: cfg.text,
          value
        }))
      }
    }
  ])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    searchParams,
    getData,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchAdminGetOrders,
      apiParams: { current: 1, size: 20, ...searchForm.value },
      columnsFactory: () => [
        { type: 'index', label: '序号', width: 70 },
        {
          prop: 'orderNo',
          label: '订单编号',
          minWidth: 200,
          formatter: (row: AdminOrderItem) => h('span', { class: 'font-mono text-xs' }, row.orderNo)
        },
        { prop: 'userId', label: '用户ID', width: 90 },
        {
          prop: 'productSnapshot',
          label: '商品名称',
          minWidth: 150,
          formatter: (row: AdminOrderItem) =>
            h('span', { class: 'line-clamp-1' }, row.productSnapshot?.name || '-')
        },
        { prop: 'quantity', label: '数量', width: 70 },
        {
          prop: 'totalPrice',
          label: '实付金额',
          width: 110,
          formatter: (row: AdminOrderItem) =>
            h(
              'span',
              { class: 'font-medium text-primary' },
              `¥${(row.totalPrice / 100).toFixed(2)}`
            )
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AdminOrderItem) => {
            const cfg = STATUS_CONFIG[row.status]
            return h(ElTag, { type: cfg?.type, size: 'small' }, () => cfg?.text ?? row.status)
          }
        },
        { prop: 'createTime', label: '下单时间', width: 180 },
        {
          prop: 'action',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: AdminOrderItem) =>
            h(ArtButtonTable, {
              type: 'view',
              title: '查看',
              onClick: () => openDetail(row)
            })
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const openDetail = (order: AdminOrderItem) => {
    currentOrder.value = order
    detailVisible.value = true
  }
</script>

<style lang="scss" scoped>
  .orders-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
