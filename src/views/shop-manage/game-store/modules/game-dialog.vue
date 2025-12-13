<!-- 游戏弹窗组件 -->
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

  defineOptions({ name: 'GameDialog' })

  interface GameData {
    id?: string
    name?: string
    platform?: string
    category?: string
    price?: number
    originalPrice?: number
    stock?: number
    status?: string
    description?: string
  }

  const props = defineProps<{
    type: DialogType
    gameData?: Partial<GameData>
  }>()

  const emit = defineEmits<{
    submit: [formData: GameData]
  }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref()
  const submitLoading = ref(false)

  const formModel = ref<GameData>({
    name: '',
    platform: 'steam',
    category: 'action',
    price: 0,
    originalPrice: undefined,
    stock: -1,
    status: 'draft',
    description: ''
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增游戏' : '编辑游戏'
  })

  const formColumns: ArtFormColumn[] = [
    {
      prop: 'name',
      label: '游戏名称',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入游戏名称',
        clearable: true
      },
      colSpan: 24
    },
    {
      prop: 'platform',
      label: '平台',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择平台'
      },
      options: [
        { label: 'Steam', value: 'steam' },
        { label: 'Epic', value: 'epic' },
        { label: 'Origin', value: 'origin' },
        { label: 'Uplay', value: 'uplay' },
        { label: 'PlayStation', value: 'playstation' },
        { label: 'Xbox', value: 'xbox' },
        { label: 'Nintendo Switch', value: 'switch' }
      ]
    },
    {
      prop: 'category',
      label: '分类',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择分类'
      },
      options: [
        { label: '动作', value: 'action' },
        { label: '冒险', value: 'adventure' },
        { label: 'RPG', value: 'rpg' },
        { label: '射击', value: 'shooter' },
        { label: '策略', value: 'strategy' },
        { label: '模拟', value: 'simulation' },
        { label: '体育', value: 'sports' },
        { label: '竞速', value: 'racing' }
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
      label: '游戏描述',
      component: 'ElInput',
      componentProps: {
        type: 'textarea',
        placeholder: '请输入游戏描述',
        rows: 3
      },
      colSpan: 24
    }
  ]

  const formRules = {
    name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
    platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
    stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  // 监听游戏数据变化
  watch(
    () => props.gameData,
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
        platform: 'steam',
        category: 'action',
        price: 0,
        originalPrice: undefined,
        stock: -1,
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
