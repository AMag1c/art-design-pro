<!-- 商品弹窗组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      :model="formModel"
      :columns="formColumns"
      :rules="formRules"
      :label-width="100"
      :col-span="12"
    />

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitLoading" v-ripple>
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ArtFormColumn } from '@/types'
  import { DialogType } from '@/types'

  defineOptions({ name: 'ProductDialog' })

  interface ProductData {
    id?: string
    name?: string
    type?: string
    price?: number
    originalPrice?: number
    stock?: number
    deliveryType?: string
    status?: string
    description?: string
  }

  const props = defineProps<{
    type: DialogType
    productData?: Partial<ProductData>
  }>()

  const emit = defineEmits<{
    submit: [formData: ProductData]
  }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref()
  const submitLoading = ref(false)

  const formModel = ref<ProductData>({
    name: '',
    type: 'email_code',
    price: 0,
    originalPrice: undefined,
    stock: -1,
    deliveryType: 'auto',
    status: 'draft',
    description: ''
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增商品' : '编辑商品'
  })

  const formColumns: ArtFormColumn[] = [
    {
      prop: 'name',
      label: '商品名称',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入商品名称',
        clearable: true
      },
      colSpan: 24
    },
    {
      prop: 'type',
      label: '商品分类',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择分类'
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
      prop: 'deliveryType',
      label: '发货方式',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择发货方式'
      },
      options: [
        { label: '自动发货', value: 'auto' },
        { label: '手动发货', value: 'manual' }
      ]
    },
    {
      prop: 'price',
      label: '售价(分)',
      component: 'ElInputNumber',
      componentProps: {
        placeholder: '请输入售价',
        min: 0,
        step: 100,
        controls: true
      }
    },
    {
      prop: 'originalPrice',
      label: '原价(分)',
      component: 'ElInputNumber',
      componentProps: {
        placeholder: '请输入原价',
        min: 0,
        step: 100,
        controls: true
      }
    },
    {
      prop: 'stock',
      label: '库存',
      component: 'ElInputNumber',
      componentProps: {
        placeholder: '-1表示无限',
        min: -1,
        controls: true
      }
    },
    {
      prop: 'status',
      label: '状态',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择状态'
      },
      options: [
        { label: '已上架', value: 'published' },
        { label: '草稿', value: 'draft' },
        { label: '已下架', value: 'unpublished' }
      ]
    },
    {
      prop: 'description',
      label: '商品描述',
      component: 'ElInput',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入商品描述',
        rows: 3
      },
      colSpan: 24
    }
  ]

  const formRules = {
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
    stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
    deliveryType: [{ required: true, message: '请选择发货方式', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  // 监听商品数据变化
  watch(
    () => props.productData,
    (newVal) => {
      if (newVal && props.type === 'edit') {
        formModel.value = { ...newVal }
      }
    },
    { immediate: true, deep: true }
  )

  // 监听弹窗打开
  watch(dialogVisible, (val) => {
    if (val && props.type === 'add') {
      formModel.value = {
        name: '',
        type: 'email_code',
        price: 0,
        originalPrice: undefined,
        stock: -1,
        deliveryType: 'auto',
        status: 'draft',
        description: ''
      }
    }
  })

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      emit('submit', formModel.value)
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }
</script>
