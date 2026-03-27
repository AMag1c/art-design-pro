<!-- 商品分类弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="480px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElFormItem label="分类名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="请输入分类名称，最多50个字符"
          clearable
          maxlength="50"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="分类描述（可选）"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem label="排序" prop="sortOrder">
        <ElInputNumber
          v-model="formData.sortOrder"
          :controls="false"
          :min="0"
          :precision="0"
          placeholder="数值越小越靠前"
          style="width: 100%"
        />
      </ElFormItem>

      <ElFormItem label="分类图标" prop="icon">
        <ImageUpload v-model="formData.icon" type="category-icon" width="80px" height="80px" />
      </ElFormItem>

      <ElFormItem label="是否启用" prop="enabled">
        <ElSwitch v-model="formData.enabled" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ props.type === 'add' ? '确定' : '保存' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { fetchCreateCategory, fetchUpdateCategory, type CategoryItem } from '@/api/shop-manage'

  defineOptions({ name: 'CategoryDialog' })

  type CategoryTreeItem = CategoryItem & { children?: CategoryTreeItem[] }

  const props = defineProps<{
    type: 'add' | 'edit'
    rowData: CategoryTreeItem | null
  }>()

  const emit = defineEmits<{ submit: [] }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const dialogTitle = computed(() => {
    if (props.type === 'add') {
      return props.rowData ? `新增子分类（父级：${props.rowData.name}）` : '新增顶级分类'
    }
    return '编辑分类'
  })

  const formData = reactive({
    name: '',
    description: '',
    sortOrder: 0,
    enabled: true,
    icon: ''
  })

  const formRules = {
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { max: 50, message: '名称不超过50个字符', trigger: 'blur' }
    ]
  }

  const initFormData = () => {
    if (props.type === 'edit' && props.rowData) {
      Object.assign(formData, {
        name: props.rowData.name,
        description: props.rowData.description || '',
        sortOrder: props.rowData.sortOrder,
        enabled: props.rowData.enabled,
        icon: props.rowData.icon || ''
      })
    } else {
      Object.assign(formData, { name: '', description: '', sortOrder: 0, enabled: true, icon: '' })
    }
  }

  watch(dialogVisible, (val) => {
    if (val) {
      initFormData()
      nextTick(() => formRef.value?.clearValidate())
    }
  })

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
      submitLoading.value = true

      const submitData = {
        name: formData.name.trim(),
        sortOrder: formData.sortOrder,
        enabled: formData.enabled,
        ...(formData.description.trim() && { description: formData.description.trim() }),
        ...(formData.icon.trim() && { icon: formData.icon.trim() })
      }

      if (props.type === 'add') {
        const parentId = props.rowData ? props.rowData.id : 0
        await fetchCreateCategory({ ...submitData, parentId })
      } else {
        await fetchUpdateCategory(props.rowData!.id, submitData)
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      if (error?.message) ElMessage.error(error.message)
    } finally {
      submitLoading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }
</script>
