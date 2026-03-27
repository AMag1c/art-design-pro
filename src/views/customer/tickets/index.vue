<!-- 工单管理 -->
<template>
  <div class="tickets-page art-full-height">
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
    </ElCard>

    <!-- 工单详情抽屉 -->
    <ElDrawer
      v-model="drawerVisible"
      title="工单详情"
      size="520px"
      destroy-on-close
      @open="loadDetail"
    >
      <template v-if="detailLoading">
        <div class="flex justify-center items-center h-40">
          <ElIcon class="is-loading" :size="28"><Loading /></ElIcon>
        </div>
      </template>
      <template v-else-if="currentTicket">
        <!-- 基本信息 -->
        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="工单编号" :span="2">
            <span class="font-mono text-xs">{{ currentTicket.ticketNo }}</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="用户ID">{{ currentTicket.userId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="关联订单">{{
            currentTicket.orderId || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="标题" :span="2">{{ currentTicket.title }}</ElDescriptionsItem>
          <ElDescriptionsItem label="分类">
            <ElTag :type="CATEGORY_CONFIG[currentTicket.category]?.type" size="small">
              {{ CATEGORY_CONFIG[currentTicket.category]?.text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="STATUS_CONFIG[currentTicket.status]?.type" size="small">
              {{ STATUS_CONFIG[currentTicket.status]?.text }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间" :span="2">{{
            currentTicket.createTime
          }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- 状态操作 -->
        <div class="mb-4 flex gap-2 flex-wrap">
          <span class="text-sm text-gray-500 self-center">变更状态：</span>
          <ElButton
            v-for="(cfg, key) in STATUS_CONFIG"
            :key="key"
            :type="cfg.type"
            size="small"
            :disabled="currentTicket.status === key || statusUpdating"
            plain
            @click="handleUpdateStatus(key)"
          >
            {{ cfg.text }}
          </ElButton>
        </div>

        <!-- 消息列表 -->
        <div class="text-sm font-medium text-gray-700 mb-2">消息记录</div>
        <div ref="msgListRef" class="msg-list">
          <div
            v-for="msg in currentTicket.messages"
            :key="msg.id"
            class="msg-item"
            :class="msg.senderType === 'admin' ? 'msg-admin' : 'msg-user'"
          >
            <div class="msg-meta">
              <span class="msg-role">{{ msg.senderType === 'admin' ? '客服' : '用户' }}</span>
              <span class="msg-time">{{ msg.createTime }}</span>
            </div>
            <div class="msg-bubble">{{ msg.content }}</div>
          </div>
          <ElEmpty v-if="!currentTicket.messages?.length" description="暂无消息" class="py-4" />
        </div>

        <!-- 回复框 -->
        <div class="reply-area" v-if="currentTicket.status !== 'closed'">
          <ElInput
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="输入回复内容..."
            :maxlength="1000"
            show-word-limit
          />
          <div class="flex justify-end mt-2">
            <ElButton type="primary" :loading="replying" @click="handleReply">发送回复</ElButton>
          </div>
        </div>
        <ElAlert v-else type="info" title="工单已关闭，无法回复" :closable="false" class="mt-2" />
      </template>

      <template #footer>
        <ElButton @click="drawerVisible = false">关闭</ElButton>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { SearchFormItem as FormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchAdminGetTickets,
    fetchAdminGetTicketDetail,
    fetchAdminReplyTicket,
    fetchAdminUpdateTicketStatus,
    type AdminTicketItem
  } from '@/api/shop-manage'
  import {
    ElTag,
    ElDrawer,
    ElDescriptions,
    ElDescriptionsItem,
    ElEmpty,
    ElInput,
    ElAlert,
    ElIcon,
    ElMessage
  } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'

  defineOptions({ name: 'AdminTickets' })

  const STATUS_CONFIG: Record<
    string,
    { type: 'info' | 'warning' | 'primary' | 'success' | 'danger'; text: string }
  > = {
    open: { type: 'warning', text: '待处理' },
    processing: { type: 'primary', text: '处理中' },
    resolved: { type: 'success', text: '已解决' },
    closed: { type: 'info', text: '已关闭' }
  }

  const CATEGORY_CONFIG: Record<
    string,
    { type: 'info' | 'warning' | 'primary' | 'success' | 'danger'; text: string }
  > = {
    general: { type: 'info', text: '通用' },
    payment: { type: 'danger', text: '支付' },
    account: { type: 'warning', text: '账号' },
    order: { type: 'primary', text: '订单' },
    other: { type: 'info', text: '其他' }
  }

  const drawerVisible = ref(false)
  const detailLoading = ref(false)
  const currentTicketId = ref<number | null>(null)
  const currentTicket = ref<AdminTicketItem | null>(null)
  const replyContent = ref('')
  const replying = ref(false)
  const statusUpdating = ref(false)
  const msgListRef = ref<HTMLElement | null>(null)

  const searchForm = ref({
    status: undefined as string | undefined,
    category: undefined as string | undefined
  })

  const searchItems = computed<FormItem[]>(() => [
    {
      key: 'status',
      label: '工单状态',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({ label: cfg.text, value }))
      }
    },
    {
      key: 'category',
      label: '问题分类',
      type: 'select',
      props: {
        placeholder: '请选择分类',
        clearable: true,
        options: Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({ label: cfg.text, value }))
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
      apiFn: fetchAdminGetTickets,
      apiParams: { current: 1, size: 20, ...searchForm.value },
      columnsFactory: () => [
        { type: 'index', label: '序号', width: 70 },
        {
          prop: 'ticketNo',
          label: '工单编号',
          minWidth: 180,
          formatter: (row: AdminTicketItem) =>
            h('span', { class: 'font-mono text-xs' }, row.ticketNo)
        },
        { prop: 'userId', label: '用户ID', width: 80 },
        { prop: 'title', label: '标题', minWidth: 180 },
        {
          prop: 'category',
          label: '分类',
          width: 90,
          formatter: (row: AdminTicketItem) => {
            const cfg = CATEGORY_CONFIG[row.category]
            return h(ElTag, { type: cfg?.type, size: 'small' }, () => cfg?.text ?? row.category)
          }
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: AdminTicketItem) => {
            const cfg = STATUS_CONFIG[row.status]
            return h(ElTag, { type: cfg?.type, size: 'small' }, () => cfg?.text ?? row.status)
          }
        },
        { prop: 'createTime', label: '创建时间', width: 180 },
        {
          prop: 'action',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: AdminTicketItem) =>
            h(ArtButtonTable, {
              type: 'view',
              title: '处理',
              onClick: () => openDrawer(row)
            })
        }
      ]
    }
  })

  const handleSearch = () => {
    Object.assign(searchParams, searchForm.value)
    getData()
  }

  const openDrawer = (ticket: AdminTicketItem) => {
    currentTicketId.value = ticket.id
    currentTicket.value = null
    replyContent.value = ''
    drawerVisible.value = true
  }

  const loadDetail = async () => {
    if (!currentTicketId.value) return
    detailLoading.value = true
    try {
      currentTicket.value = (await fetchAdminGetTicketDetail(currentTicketId.value)) as any
      nextTick(() => scrollToBottom())
    } catch {
      ElMessage.error('加载工单详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  const scrollToBottom = () => {
    if (msgListRef.value) {
      msgListRef.value.scrollTop = msgListRef.value.scrollHeight
    }
  }

  const handleReply = async () => {
    if (!currentTicket.value || !replyContent.value.trim()) return
    replying.value = true
    try {
      await fetchAdminReplyTicket(currentTicket.value.id, replyContent.value.trim())
      replyContent.value = ''
      await loadDetail()
    } catch {
      ElMessage.error('回复失败')
    } finally {
      replying.value = false
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!currentTicket.value) return
    statusUpdating.value = true
    try {
      await fetchAdminUpdateTicketStatus(currentTicket.value.id, status)
      currentTicket.value.status = status as AdminTicketItem['status']
      ElMessage.success('状态已更新')
      refreshData()
    } catch {
      ElMessage.error('状态更新失败')
    } finally {
      statusUpdating.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .tickets-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .msg-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 320px;
    padding: 12px;
    margin-bottom: 12px;
    overflow-y: auto;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .msg-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 80%;
  }

  .msg-admin {
    align-items: flex-end;
    align-self: flex-end;
  }

  .msg-user {
    align-items: flex-start;
    align-self: flex-start;
  }

  .msg-meta {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .msg-role {
    font-weight: 600;
  }

  .msg-bubble {
    padding: 8px 12px;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-all;
    white-space: pre-wrap;
    border-radius: 8px;

    .msg-admin & {
      color: var(--el-color-primary-dark-2);
      background: var(--el-color-primary-light-8);
    }

    .msg-user & {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color);
    }
  }

  .reply-area {
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
