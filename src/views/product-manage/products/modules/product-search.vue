<!-- 商品搜索组件 -->
<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formModel"
    :items="formItems"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script setup lang="ts">
  import { fetchAdminGetCategories, type CategoryItem } from '@/api/shop-manage'

  defineOptions({ name: 'ProductSearch' })

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const formModel = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const categoryList = ref<CategoryItem[]>([])

  onMounted(async () => {
    try {
      categoryList.value = ((await fetchAdminGetCategories()) as any) || []
    } catch {
      categoryList.value = []
    }
  })

  const formItems = computed(() => [
    {
      label: '商品名称',
      key: 'keyword',
      type: 'input',
      props: { placeholder: '请输入商品名称', clearable: true }
    },
    {
      label: '分类',
      key: 'categoryId',
      type: 'select',
      props: {
        placeholder: '请选择分类',
        clearable: true,
        options: categoryList.value.map((c) => ({ label: c.name, value: c.id }))
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        placeholder: '请选择状态',
        clearable: true,
        options: [
          { label: '已上架', value: 'on_sale' },
          { label: '已下架', value: 'off_sale' }
        ]
      }
    }
  ])

  function handleSearch() {
    emit('search', formModel.value)
  }

  function handleReset() {
    emit('reset')
  }
</script>
