<!-- 游戏分类弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增游戏分类' : '编辑游戏分类'"
    width="520px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
      <ElFormItem label="分类名称" prop="name">
        <ElInput
          v-model="formData.name"
          placeholder="如：动作冒险、角色扮演"
          clearable
          maxlength="50"
        />
      </ElFormItem>

      <ElFormItem label="英文名称" prop="nameEn">
        <ElInput
          v-model="formData.nameEn"
          placeholder="如：Action & Adventure"
          clearable
          maxlength="100"
        />
      </ElFormItem>

      <ElRow :gutter="16">
        <ElCol :span="12">
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
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="是否启用" prop="enabled">
            <ElSwitch v-model="formData.enabled" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="分类图标" prop="icon">
        <ImageUpload v-model="formData.icon" type="category-icon" width="80px" height="80px" />
      </ElFormItem>

      <ElFormItem label="封面图片" prop="coverImage">
        <div class="flex items-center gap-3">
          <ImageUpload
            v-model="formData.coverImage"
            type="category-icon"
            width="100px"
            height="100px"
          />
          <span class="text-xs text-gray-400">支持 jpg/png/webp/gif，最大 10MB</span>
        </div>
      </ElFormItem>

      <ElFormItem label="分类描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入分类描述"
          maxlength="200"
          show-word-limit
        />
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
  import { DialogType } from '@/types'
  import {
    fetchCreateGameCategory,
    fetchUpdateGameCategory,
    type GameCategory
  } from '@/api/shop-manage'

  defineOptions({ name: 'GameCategoryDialog' })

  const props = defineProps<{
    type: DialogType
    categoryData?: Partial<GameCategory>
  }>()

  const emit = defineEmits<{ submit: [] }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)

  const formData = reactive({
    name: '',
    nameEn: '',
    icon: '',
    coverImage: '',
    description: '',
    sortOrder: 0,
    enabled: true
  })

  const formRules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
  }

  const initFormData = () => {
    if (props.type === 'edit' && props.categoryData) {
      const row = props.categoryData
      Object.assign(formData, {
        name: row.name || '',
        nameEn: row.nameEn || '',
        icon: row.icon || '',
        coverImage: row.coverImage || '',
        description: row.description || '',
        sortOrder: row.sortOrder ?? 0,
        enabled: row.enabled ?? true
      })
    } else {
      Object.assign(formData, {
        name: '',
        nameEn: '',
        icon: '',
        coverImage: '',
        description: '',
        sortOrder: 0,
        enabled: true
      })
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

      const submitData: Record<string, any> = {
        name: formData.name.trim(),
        sortOrder: formData.sortOrder,
        enabled: formData.enabled
      }
      if (formData.nameEn.trim()) submitData.nameEn = formData.nameEn.trim()
      if (formData.icon.trim()) submitData.icon = formData.icon.trim()
      if (formData.coverImage.trim()) submitData.coverImage = formData.coverImage.trim()
      if (formData.description.trim()) submitData.description = formData.description.trim()

      if (props.type === 'add') {
        await fetchCreateGameCategory(submitData)
      } else {
        const id = props.categoryData?.id
        if (!id) {
          ElMessage.error('分类ID不存在')
          return
        }
        await fetchUpdateGameCategory(id, submitData)
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
