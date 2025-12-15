<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>
              <ElIcon>
                <Plus />
              </ElIcon>
              新增用户
            </ElButton>

            <!-- 导出导入功能 -->
            <ArtExcelExport
              :data="data as any"
              :columns="exportColumns as any"
              filename="用户数据"
              :auto-index="true"
              button-text="导出Excel"
              @export-success="handleExportSuccess"
            />
            <ArtExcelImport
              @import-success="handleImportSuccess"
              @import-error="handleImportError"
            />

            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <ElIcon>
                <Delete />
              </ElIcon>
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

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtExcelExport from '@/components/core/forms/art-excel-export/index.vue'
  import ArtExcelImport from '@/components/core/forms/art-excel-import/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList, fetchDeleteUser, fetchBatchDeleteUsers } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElMessage, ElIcon } from 'element-plus'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  // 性别映射
  const GENDER_MAP = {
    male: '男',
    female: '女',
    other: '其他',
    unknown: '未知'
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 获取性别显示文本
   */
  const getGenderText = (gender: string) => {
    return GENDER_MAP[gender as keyof typeof GENDER_MAP] || '未知'
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
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userInfo',
          label: '用户名',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userName),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'userGender',
          label: '性别',
          sortable: true,
          formatter: (row) => getGenderText(row.userGender)
        },
        { prop: 'userPhone', label: '手机号' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = async (row: UserListItem): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？`, '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await fetchDeleteUser(row.id)
      // 刷新表格
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  /**
   * 处理选中行变化
   */
  const handleSelectionChange = (rows: UserListItem[]) => {
    selectedRows.value = rows
  }

  /**
   * 导出列配置
   */
  const exportColumns = computed(() => [
    { prop: 'userName', label: '用户名' },
    { prop: 'userGender', label: '性别' },
    { prop: 'userPhone', label: '手机号' },
    { prop: 'userEmail', label: '邮箱' },
    {
      prop: 'status',
      label: '状态',
      formatter: (row: UserListItem) => {
        const config = getUserStatusConfig(row.status)
        return config.text
      }
    },
    { prop: 'createTime', label: '创建日期' }
  ])

  /**
   * 导出成功回调
   */
  const handleExportSuccess = () => {
    ElMessage.success('导出成功')
  }

  /**
   * 导入成功回调
   */
  const handleImportSuccess = (data: any) => {
    console.log('导入数据:', data)
    ElMessage.success(`成功导入 ${data.length} 条数据`)
    // 刷新表格数据
    refreshData()
  }

  /**
   * 导入失败回调
   */
  const handleImportError = (error: any) => {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请检查文件格式')
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的用户')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map((row) => row.id)
      await fetchBatchDeleteUsers(ids)

      // 清空选中
      selectedRows.value = []
      // 刷新表格
      refreshData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
      }
    }
  }

  /**
   * 处理对话框提交
   */
  const handleDialogSubmit = () => {
    // 刷新表格数据
    refreshData()
  }
</script>
