<template>
  <ElDialog
    v-model="dialogVisible"
    :title="props.type === 'add' ? '新增游戏' : '编辑游戏'"
    width="880px"
    align-center
    @closed="handleClosed"
  >
    <ElTabs v-model="activeTab">
      <!-- ── Tab 1: 基本信息 ── -->
      <ElTabPane label="基本信息" name="basic">
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="90px">
          <ElRow :gutter="16">
            <ElCol :span="24">
              <ElFormItem label="游戏名称" prop="name">
                <ElInput
                  v-model="formData.name"
                  placeholder="请输入游戏名称（中文）"
                  clearable
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="英文名" prop="nameEn">
                <ElInput
                  v-model="formData.nameEn"
                  placeholder="请输入英文名称"
                  clearable
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="游戏分类" prop="categoryId">
                <ElSelect
                  v-model="formData.categoryId"
                  placeholder="请选择游戏分类"
                  clearable
                  style="width: 100%"
                  :loading="categoriesLoading"
                >
                  <ElOption
                    v-for="cat in categories"
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
              <ElFormItem label="精选推荐" prop="isFeatured">
                <ElSwitch v-model="formData.isFeatured" />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem prop="price">
                <template #label
                  >售价&nbsp;<span class="text-xs text-gray-400">游戏币</span></template
                >
                <ElInputNumber
                  v-model="formData.price"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  placeholder="0 表示免费"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem prop="originalPrice">
                <template #label
                  >原价&nbsp;<span class="text-xs text-gray-400">游戏币</span></template
                >
                <ElInputNumber
                  v-model="formData.originalPrice"
                  :controls="false"
                  :min="1"
                  :precision="0"
                  placeholder="留空表示无折扣"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem prop="memberPrice">
                <template #label
                  >会员价&nbsp;<span class="text-xs text-gray-400">游戏币</span></template
                >
                <ElInputNumber
                  v-model="formData.memberPrice"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  placeholder="0 表示同普通价"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem label="评分" prop="rating">
                <ElInputNumber
                  v-model="formData.rating"
                  :controls="false"
                  :min="0"
                  :max="5"
                  :precision="1"
                  placeholder="0 ~ 5.0"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem label="发行日期" prop="releaseDate">
                <ElInput
                  v-model="formData.releaseDate"
                  placeholder="如：2025-01-01"
                  clearable
                  maxlength="20"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
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

            <ElCol :span="8">
              <ElFormItem label="下载量" prop="downloads">
                <ElInputNumber
                  v-model="formData.downloads"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="8">
              <ElFormItem label="浏览量" prop="views">
                <ElInputNumber
                  v-model="formData.views"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  style="width: 100%"
                />
              </ElFormItem>
            </ElCol>

            <!-- 空列占位，保持三列布局对齐 -->
            <ElCol :span="8" />

            <ElCol :span="24">
              <ElFormItem label="封面图片" prop="coverImage">
                <ElInput v-model="formData.coverImage" placeholder="请输入封面图片URL" clearable />
              </ElFormItem>
            </ElCol>

            <ElCol :span="24">
              <ElFormItem label="游戏简介" prop="description">
                <ElInput
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入游戏简介"
                  maxlength="1000"
                  show-word-limit
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElTabPane>

      <!-- ── Tab 2: 版本信息 ── -->
      <ElTabPane label="版本信息" name="version">
        <ElForm :model="versionData" label-width="110px">
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem label="版本号">
                <ElInput
                  v-model="versionData.version"
                  placeholder="如：v1.0.0"
                  clearable
                  maxlength="50"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="文件大小">
                <ElInput
                  v-model="versionData.size"
                  placeholder="如：39.7GB"
                  clearable
                  maxlength="50"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="语言支持">
                <ElInput
                  v-model="versionData.language"
                  placeholder="如：官方简体中文"
                  clearable
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="操作方式">
                <ElInput
                  v-model="versionData.support"
                  placeholder="如：键盘/鼠标/手柄"
                  clearable
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="激活码/解压密码">
                <ElInput
                  v-model="versionData.activationCode"
                  placeholder="如：XDGAME"
                  clearable
                  maxlength="100"
                />
              </ElFormItem>
            </ElCol>

            <ElCol :span="12">
              <ElFormItem label="下载有效期·天">
                <ElInputNumber
                  v-model="versionData.validDays"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  placeholder="天数，0=无限制"
                  style="width: 100%"
                />
                <span
                  class="el-form-item__extra"
                  style="margin-left: 8px; font-size: 12px; color: #999"
                  >天（0=无限制）</span
                >
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElTabPane>

      <!-- ── Tab 3: 下载链接 ── -->
      <ElTabPane label="下载链接" name="links">
        <div class="mb-3 text-sm text-gray-500">
          购买成功后用户可见，支持百度网盘、天翼云盘等多平台
        </div>

        <div class="space-y-2">
          <div v-for="(link, index) in downloadLinks" :key="index" class="flex items-center gap-2">
            <ElInput
              v-model="link.name"
              placeholder="如：百度网盘"
              style="flex-shrink: 0; width: 140px"
            />
            <ElInput v-model="link.url" placeholder="https://..." style="flex: 1" />
            <ElInput
              v-model="link.password"
              placeholder="提取码（可选）"
              style="flex-shrink: 0; width: 120px"
            />
            <ElButton type="danger" :icon="Delete" circle size="small" @click="removeLink(index)" />
          </div>
        </div>

        <div class="mt-3">
          <ElButton type="primary" plain :disabled="downloadLinks.length >= 10" @click="addLink">
            ＋ 添加链接
          </ElButton>
          <span v-if="downloadLinks.length >= 10" class="ml-2 text-sm text-gray-400">
            最多 10 条
          </span>
        </div>
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ props.type === 'add' ? '确定' : '保存' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { Delete } from '@element-plus/icons-vue'
  import type { FormInstance } from 'element-plus'
  import { ElMessage, ElOption } from 'element-plus'
  import { DialogType } from '@/types'
  import {
    fetchCreateGameItem,
    fetchUpdateGameItem,
    fetchAdminGetGameDetail,
    fetchAdminGetGameCategories,
    type GameItem,
    type GameCategory,
    type DownloadLink
  } from '@/api/shop-manage'

  defineOptions({ name: 'GameDialog' })

  const props = defineProps<{
    type: DialogType
    gameData?: Partial<GameItem>
  }>()

  const emit = defineEmits<{ submit: [] }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref<FormInstance>()
  const submitLoading = ref(false)
  const categories = ref<GameCategory[]>([])
  const categoriesLoading = ref(false)
  const activeTab = ref('basic')

  // ── Tab 1 表单数据 ──────────────────────────────────────────
  const formData = reactive({
    name: '',
    nameEn: '',
    categoryId: undefined as number | undefined,
    status: 'off_sale' as string,
    isFeatured: false,
    price: 0 as number,
    originalPrice: undefined as number | undefined,
    memberPrice: 0 as number,
    rating: 0 as number,
    releaseDate: '',
    downloads: 0,
    views: 0,
    sortOrder: 0,
    coverImage: '',
    description: ''
  })

  // ── Tab 2 版本信息 ──────────────────────────────────────────
  const versionData = reactive({
    version: '',
    size: '',
    language: '',
    support: '',
    activationCode: '',
    validDays: 0
  })

  // ── Tab 3 下载链接 ──────────────────────────────────────────
  const downloadLinks = ref<DownloadLink[]>([])

  const addLink = () => {
    if (downloadLinks.value.length < 10) {
      downloadLinks.value.push({ name: '', url: '', password: '' })
    }
  }

  const removeLink = (index: number) => {
    downloadLinks.value.splice(index, 1)
  }

  // ── 表单校验规则 ────────────────────────────────────────────
  const formRules = {
    name: [{ required: true, message: '请输入游戏名称', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  // ── 加载游戏分类列表 ────────────────────────────────────────
  const loadCategories = async () => {
    categoriesLoading.value = true
    try {
      const res = await fetchAdminGetGameCategories()
      categories.value = ((res as any).list ?? res ?? []) as GameCategory[]
    } catch {
      categories.value = []
    } finally {
      categoriesLoading.value = false
    }
  }

  // ── 初始化表单（新增 / 编辑） ────────────────────────────────
  const initFormData = async () => {
    activeTab.value = 'basic'
    downloadLinks.value = []

    if (props.type === 'edit' && props.gameData?.id) {
      // 编辑模式：调用详情接口获取含 downloadLinks 的完整数据
      try {
        const row = await fetchAdminGetGameDetail(props.gameData.id)
        Object.assign(formData, {
          name: row.name || '',
          nameEn: row.nameEn || '',
          categoryId: row.categoryId || undefined,
          status: row.status || 'off_sale',
          isFeatured: row.isFeatured ?? false,
          price: row.price ?? 0,
          originalPrice: row.originalPrice ?? undefined,
          memberPrice: row.memberPrice ?? 0,
          rating: row.rating ?? 0,
          releaseDate: row.releaseDate || '',
          downloads: row.downloads ?? 0,
          views: row.views ?? 0,
          sortOrder: row.sortOrder ?? 0,
          coverImage: row.coverImage || '',
          description: row.description || ''
        })
        Object.assign(versionData, {
          version: row.version || '',
          size: row.size || '',
          language: row.language || '',
          support: row.support || '',
          activationCode: row.activationCode || '',
          validDays: row.validDays ?? 0
        })
        downloadLinks.value = Array.isArray(row.downloadLinks)
          ? row.downloadLinks.map((l) => ({ ...l }))
          : []
      } catch {
        ElMessage.error('加载游戏详情失败')
      }
    } else {
      // 新增模式：重置所有字段
      Object.assign(formData, {
        name: '',
        nameEn: '',
        categoryId: undefined,
        status: 'off_sale',
        isFeatured: false,
        price: 0,
        originalPrice: undefined,
        memberPrice: 0,
        rating: 0,
        releaseDate: '',
        downloads: 0,
        views: 0,
        sortOrder: 0,
        coverImage: '',
        description: ''
      })
      Object.assign(versionData, {
        version: '',
        size: '',
        language: '',
        support: '',
        activationCode: '',
        validDays: 0
      })
    }
  }

  watch(dialogVisible, (val) => {
    if (val) {
      loadCategories()
      initFormData()
      nextTick(() => formRef.value?.clearValidate())
    }
  })

  // ── 提交 ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) {
        activeTab.value = 'basic' // 校验失败时切回基本信息 tab
        return
      }
      submitLoading.value = true

      // Tab 1 基础字段
      const submitData: Record<string, any> = {
        name: formData.name.trim(),
        categoryId: formData.categoryId ?? 0,
        status: formData.status,
        isFeatured: formData.isFeatured,
        price: formData.price ?? 0,
        memberPrice: formData.memberPrice ?? 0,
        rating: formData.rating,
        downloads: formData.downloads,
        views: formData.views,
        sortOrder: formData.sortOrder
      }

      if (formData.nameEn.trim()) submitData.nameEn = formData.nameEn.trim()
      // originalPrice: 有值则传，null/undefined 则不传（不传代表不修改；已知限制：编辑时无法清除原有值）
      if (formData.originalPrice != null) submitData.originalPrice = formData.originalPrice
      if (formData.releaseDate.trim()) submitData.releaseDate = formData.releaseDate.trim()
      if (formData.coverImage.trim()) submitData.coverImage = formData.coverImage.trim()
      if (formData.description.trim()) submitData.description = formData.description.trim()

      // Tab 2 版本信息（空字符串不传）
      if (versionData.version.trim()) submitData.version = versionData.version.trim()
      if (versionData.size.trim()) submitData.size = versionData.size.trim()
      if (versionData.language.trim()) submitData.language = versionData.language.trim()
      if (versionData.support.trim()) submitData.support = versionData.support.trim()
      if (versionData.activationCode.trim())
        submitData.activationCode = versionData.activationCode.trim()
      submitData.validDays = versionData.validDays ?? 0

      // Tab 3 下载链接（过滤无效行）
      submitData.downloadLinks = downloadLinks.value.filter((l) => l.name.trim() && l.url.trim())

      if (props.type === 'add') {
        await fetchCreateGameItem(submitData)
      } else {
        const id = props.gameData?.id
        if (!id) {
          ElMessage.error('游戏ID不存在')
          return
        }
        await fetchUpdateGameItem(id, submitData)
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      if (error?.message) ElMessage.error(error.message)
    } finally {
      submitLoading.value = false
    }
  }

  // ── 关闭后重置 ───────────────────────────────────────────────
  const handleClosed = () => {
    formRef.value?.resetFields()
    downloadLinks.value = []
    Object.assign(versionData, {
      version: '',
      size: '',
      language: '',
      support: '',
      activationCode: '',
      validDays: 0
    })
  }
</script>
