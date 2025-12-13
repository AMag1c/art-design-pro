<!-- 商品搜索组件 -->
<template>
  <ElCard shadow="never">
    <ArtForm
      ref="formRef"
      :model="formModel"
      :columns="formColumns"
      :label-width="80"
      :col-span="6"
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

  defineOptions({ name: 'ProductSearch' })

  const formModel = defineModel<{
    name?: string
    type?: string
    status?: string
    deliveryType?: string
  }>({ required: true })

  const emit = defineEmits<{
    search: []
    reset: []
  }>()

  const formRef = ref()

  const formColumns: ArtFormColumn[] = [
    {
      prop: 'name',
      label: '商品名称',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入商品名称',
        clearable: true
      }
    },
    {
      prop: 'type',
      label: '商品分类',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择分类',
        clearable: true
      },
      options: [
        { label: '邮箱接码', value: 'email_code' },
        { label: '游戏账户', value: 'game_account' },
        { label: '谷歌账户', value: 'google_account' },
        { label: '社交媒体', value: 'social_account' },
        { label: '激活码', value: 'activation_code' },
        { label: '会员订阅', value: 'subscription' }
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
    },
    {
      prop: 'deliveryType',
      label: '发货方式',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择发货方式',
        clearable: true
      },
      options: [
        { label: '自动发货', value: 'auto' },
        { label: '手动发货', value: 'manual' }
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
