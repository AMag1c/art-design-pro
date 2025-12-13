<!-- 邮箱IMAP搜索组件 -->
<template>
  <ElCard shadow="never">
    <ArtForm
      ref="formRef"
      :model="formModel"
      :columns="formColumns"
      :label-width="100"
      :col-span="8"
      @submit="handleSubmit"
      @reset="handleReset"
    >
      <template #action>
        <ElButton type="primary" @click="handleSubmit" v-ripple>
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
</template>

<script setup lang="ts">
  import { ArtFormColumn } from '@/types'

  defineOptions({ name: 'EmailImapSearch' })

  const formModel = defineModel<{
    email?: string
    imapServer?: string
    status?: string
  }>({ required: true })

  const emit = defineEmits<{
    search: []
    reset: []
  }>()

  const formRef = ref()

  const formColumns: ArtFormColumn[] = [
    {
      prop: 'email',
      label: '邮箱地址',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入邮箱地址',
        clearable: true
      }
    },
    {
      prop: 'imapServer',
      label: 'IMAP服务器',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入IMAP服务器',
        clearable: true
      }
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
        { label: '正常', value: 'active' },
        { label: '未激活', value: 'inactive' },
        { label: '连接失败', value: 'error' }
      ]
    }
  ]

  const handleSubmit = () => {
    emit('search')
  }

  const handleReset = () => {
    formRef.value?.resetFields()
    emit('reset')
  }
</script>
