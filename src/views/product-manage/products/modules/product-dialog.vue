<!-- 商品弹窗组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增商品' : '编辑商品'"
    width="660px"
    align-center
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="商品名称" prop="name">
            <ElInput
              v-model="formData.name"
              placeholder="请输入商品名称"
              clearable
              maxlength="100"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="商品分类" prop="categoryId">
            <ElSelect v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
              <ElOption
                v-for="cat in categoryList"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="formData.status">
              <ElRadio value="on_sale">上架</ElRadio>
              <ElRadio value="off_sale">下架</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem prop="price">
            <template #label> 售价&nbsp;<span class="text-xs text-gray-400">元</span> </template>
            <ElInputNumber
              v-model="formData.price"
              :controls="false"
              :min="0.01"
              :precision="2"
              placeholder="如：9.99"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem prop="originalPrice">
            <template #label> 原价&nbsp;<span class="text-xs text-gray-400">元</span> </template>
            <ElInputNumber
              v-model="formData.originalPrice"
              :controls="false"
              :min="0.01"
              :precision="2"
              placeholder="留空表示无折扣"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="库存" prop="stock">
            <ElInputNumber
              v-model="formData.stock"
              :controls="false"
              :min="0"
              :precision="0"
              placeholder="请输入库存数量"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

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

        <ElCol :span="24">
          <ElFormItem label="封面图片" prop="coverImage">
            <div class="flex items-center gap-3">
              <ImageUpload
                v-model="formData.coverImage"
                type="product-cover"
                width="100px"
                height="100px"
              />
              <span class="text-xs text-gray-400">支持 jpg/png/webp/gif，最大 10MB</span>
            </div>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="商品描述" prop="description">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入商品描述"
              maxlength="500"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
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
    fetchAdminGetCategories,
    fetchCreateProduct,
    fetchUpdateProduct,
    type CategoryItem,
    type ProductItem
  } from '@/api/shop-manage'

  defineOptions({ name: 'ProductDialog' })

  const props = defineProps<{
    type: DialogType
    productData?: Partial<ProductItem>
  }>()

  const emit = defineEmits<{ submit: [] }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const categoryList = ref<CategoryItem[]>([])

  const formData = reactive({
    name: '',
    categoryId: undefined as number | undefined,
    status: 'off_sale' as string,
    price: undefined as number | undefined, // 元，提交时转换为分
    originalPrice: undefined as number | undefined, // 元，提交时转换为分
    stock: 0,
    sortOrder: 0,
    description: '',
    coverImage: ''
  })

  const formRules = {
    name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
    stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
  }

  const loadCategories = async () => {
    if (categoryList.value.length > 0) return
    try {
      categoryList.value = ((await fetchAdminGetCategories()) as any) || []
    } catch {
      categoryList.value = []
    }
  }

  const initFormData = () => {
    if (props.type === 'edit' && props.productData) {
      const row = props.productData
      Object.assign(formData, {
        name: row.name || '',
        categoryId: row.categoryId,
        status: row.status || 'off_sale',
        price: row.price != null ? row.price / 100 : undefined,
        originalPrice: row.originalPrice != null ? row.originalPrice / 100 : undefined,
        stock: row.stock ?? 0,
        sortOrder: row.sortOrder ?? 0,
        description: row.description || '',
        coverImage: row.coverImage || ''
      })
    } else {
      Object.assign(formData, {
        name: '',
        categoryId: undefined,
        status: 'off_sale',
        price: undefined,
        originalPrice: undefined,
        stock: 0,
        sortOrder: 0,
        description: '',
        coverImage: ''
      })
    }
  }

  watch(dialogVisible, async (val) => {
    if (val) {
      await loadCategories()
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
        categoryId: formData.categoryId,
        status: formData.status,
        price: Math.round((formData.price ?? 0) * 100),
        stock: formData.stock,
        sortOrder: formData.sortOrder
      }
      if (formData.originalPrice != null) {
        submitData.originalPrice = Math.round(formData.originalPrice * 100)
      }
      if (formData.description.trim()) {
        submitData.description = formData.description.trim()
      }
      if (formData.coverImage.trim()) {
        submitData.coverImage = formData.coverImage.trim()
      }

      if (props.type === 'add') {
        await fetchCreateProduct(submitData)
      } else {
        const id = props.productData?.id
        if (!id) {
          ElMessage.error('商品ID不存在')
          return
        }
        await fetchUpdateProduct(id, submitData)
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
