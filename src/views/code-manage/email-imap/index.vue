<!-- 邮箱IMAP管理页面 -->
<template>
  <div class="email-imap-page art-full-height">
    <!-- 搜索栏 -->
    <EmailImapSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></EmailImapSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple type="primary">
              <template #icon>
                <SvgIcon name="ri:add-line" />
              </template>
              新增邮箱
            </ElButton>
            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <template #icon>
                <SvgIcon name="ri:delete-bin-line" />
              </template>
              批量删除
            </ElButton>
            <ElButton @click="handleTestConnection" :disabled="selectedRows.length === 0" v-ripple>
              <template #icon>
                <SvgIcon name="ri:refresh-line" />
              </template>
              测试连接
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

      <!-- 邮箱弹窗 -->
      <EmailImapDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :email-data="currentEmailData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import EmailImapSearch from './modules/email-imap-search.vue'
  import EmailImapDialog from './modules/email-imap-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'EmailImapManage' })

  // 邮箱数据类型
  interface EmailImapItem {
    id: string
    email: string
    imapServer: string
    imapPort: number
    username: string
    password: string
    useSsl: boolean
    status: 'active' | 'inactive' | 'error'
    lastCheckTime?: string
    messageCount: number
    createdAt: string
    updatedAt: string
  }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentEmailData = ref<Partial<EmailImapItem>>({})

  // 选中行
  const selectedRows = ref<EmailImapItem[]>([])

  // 搜索表单
  const searchForm = ref({
    email: undefined,
    imapServer: undefined,
    status: undefined
  })

  // 状态配置
  const STATUS_CONFIG = {
    active: { type: 'success' as const, text: '正常' },
    inactive: { type: 'info' as const, text: '未激活' },
    error: { type: 'danger' as const, text: '连接失败' }
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
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange: onSelectionChange,
    refreshData,
    resetSearchParams
  } = useTable<EmailImapItem>({
    // 模拟API请求
    apiFn: async () => {
      // 模拟数据
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockData: EmailImapItem[] = [
            {
              id: '1',
              email: 'test1@gmail.com',
              imapServer: 'imap.gmail.com',
              imapPort: 993,
              username: 'test1@gmail.com',
              password: '********',
              useSsl: true,
              status: 'active',
              lastCheckTime: '2024-12-08 10:30:00',
              messageCount: 156,
              createdAt: '2024-11-01',
              updatedAt: '2024-12-08'
            },
            {
              id: '2',
              email: 'test2@outlook.com',
              imapServer: 'outlook.office365.com',
              imapPort: 993,
              username: 'test2@outlook.com',
              password: '********',
              useSsl: true,
              status: 'active',
              lastCheckTime: '2024-12-08 09:15:00',
              messageCount: 89,
              createdAt: '2024-11-05',
              updatedAt: '2024-12-08'
            },
            {
              id: '3',
              email: 'test3@qq.com',
              imapServer: 'imap.qq.com',
              imapPort: 993,
              username: 'test3@qq.com',
              password: '********',
              useSsl: true,
              status: 'error',
              lastCheckTime: '2024-12-07 18:20:00',
              messageCount: 0,
              createdAt: '2024-11-10',
              updatedAt: '2024-12-07'
            },
            {
              id: '4',
              email: 'test4@163.com',
              imapServer: 'imap.163.com',
              imapPort: 993,
              username: 'test4@163.com',
              password: '********',
              useSsl: true,
              status: 'inactive',
              lastCheckTime: undefined,
              messageCount: 0,
              createdAt: '2024-12-01',
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
      { prop: 'email', label: '邮箱地址', minWidth: 200 },
      { prop: 'imapServer', label: 'IMAP服务器', minWidth: 180 },
      {
        prop: 'imapPort',
        label: '端口',
        width: 80
      },
      {
        prop: 'useSsl',
        label: 'SSL',
        width: 80,
        formatter: (row: EmailImapItem) => {
          return row.useSsl ? '是' : '否'
        }
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: EmailImapItem) => {
          const config = getStatusConfig(row.status)
          return h(ElTag, { type: config.type }, () => config.text)
        }
      },
      {
        prop: 'messageCount',
        label: '邮件数',
        width: 100
      },
      {
        prop: 'lastCheckTime',
        label: '最后检查时间',
        minWidth: 160,
        formatter: (row: EmailImapItem) => {
          return row.lastCheckTime || '-'
        }
      },
      { prop: 'createdAt', label: '创建时间', width: 120 },
      {
        prop: 'action',
        label: '操作',
        width: 240,
        fixed: 'right',
        formatter: (row: EmailImapItem) => {
          return h(ArtButtonTable, {
            buttons: [
              {
                text: '编辑',
                type: 'primary',
                link: true,
                onClick: () => showDialog('edit', row)
              },
              {
                text: '测试连接',
                type: 'success',
                link: true,
                onClick: () => handleTestSingle(row)
              },
              {
                text: row.status === 'active' ? '禁用' : '启用',
                type: row.status === 'active' ? 'warning' : 'success',
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
  const handleSelectionChange = (rows: EmailImapItem[]) => {
    selectedRows.value = rows
    onSelectionChange(rows)
  }

  /**
   * 显示弹窗
   */
  const showDialog = (type: DialogType, emailData?: EmailImapItem) => {
    dialogType.value = type
    currentEmailData.value = emailData ? { ...emailData } : {}
    dialogVisible.value = true
  }

  /**
   * 处理弹窗提交
   */
  const handleDialogSubmit = async () => {
    try {
      if (dialogType.value === 'add') {
        ElMessage.success('新增邮箱成功')
      } else {
        ElMessage.success('编辑邮箱成功')
      }
      dialogVisible.value = false
      refreshData()
    } catch {
      ElMessage.error('操作失败')
    }
  }

  /**
   * 测试单个连接
   */
  const handleTestSingle = async (row: EmailImapItem) => {
    try {
      ElMessage.info('正在测试连接...')
      // 调用测试连接API
      await new Promise((resolve) => setTimeout(resolve, 1500))
      ElMessage.success(`邮箱 ${row.email} 连接测试成功`)
      refreshData()
    } catch {
      ElMessage.error('连接测试失败')
    }
  }

  /**
   * 批量测试连接
   */
  const handleTestConnection = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要测试的邮箱')
      return
    }
    try {
      ElMessage.info(`正在测试 ${selectedRows.value.length} 个邮箱连接...`)
      // 调用批量测试API
      await new Promise((resolve) => setTimeout(resolve, 2000))
      ElMessage.success('批量测试完成')
      refreshData()
    } catch {
      ElMessage.error('批量测试失败')
    }
  }

  /**
   * 切换邮箱状态
   */
  const handleToggleStatus = async (row: EmailImapItem) => {
    const action = row.status === 'active' ? '禁用' : '启用'
    try {
      await ElMessageBox.confirm(`确定要${action}邮箱 ${row.email} 吗？`, '提示', {
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
   * 删除邮箱
   */
  const handleDelete = async (row: EmailImapItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除邮箱 ${row.email} 吗？此操作不可恢复！`, '警告', {
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
      ElMessage.warning('请先选择要删除的邮箱')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个邮箱吗？此操作不可恢复！`,
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
  .email-imap-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
