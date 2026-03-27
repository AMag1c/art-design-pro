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

            <ElCol :span="8" />

            <!-- 游戏截图（第一张自动作为封面） -->
            <ElCol :span="24">
              <ElFormItem label="游戏截图">
                <div class="w-full">
                  <p class="text-xs text-gray-400 mb-2">
                    第一张将作为封面 · 可拖拽排序 · 最多 10 张 · 支持多选
                  </p>
                  <!-- 截图网格：draggable 设为 contents 使子项直接参与外层 flex 布局 -->
                  <div class="flex flex-wrap gap-2 items-start">
                    <draggable
                      v-model="formData.screenshots"
                      item-key="id"
                      handle=".drag-handle"
                      class="contents"
                    >
                      <template #item="{ element, index }">
                        <div class="relative group shrink-0" style="width: 100px; height: 100px">
                          <!-- 封面标记 -->
                          <span
                            v-if="index === 0 && element.url"
                            class="absolute top-1 left-1 z-20 bg-primary/90 text-white text-[9px] px-1 py-0.5 rounded leading-3 pointer-events-none select-none"
                            >封面</span
                          >
                          <!-- 拖拽手柄（悬停显示） -->
                          <span
                            v-if="element.url"
                            class="drag-handle absolute bottom-1 left-1 z-20 cursor-move bg-black/50 text-white rounded px-1 text-[10px] leading-4 select-none opacity-0 group-hover:opacity-100 transition-opacity"
                            >⠿</span
                          >
                          <!-- 删除按钮（悬停显示） -->
                          <button
                            type="button"
                            class="absolute top-1 right-1 z-20 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            @click.prevent="removeScreenshot(index)"
                            >×</button
                          >
                          <!-- 图片区 / 上传中 -->
                          <div
                            class="w-full h-full overflow-hidden rounded border border-dashed"
                            :class="
                              element.url ? 'border-transparent cursor-pointer' : 'border-gray-300'
                            "
                            @click="element.url ? openPreview(index) : undefined"
                          >
                            <!-- 上传中状态 -->
                            <div
                              v-if="element.uploading"
                              class="flex h-full flex-col items-center justify-center gap-1 text-gray-400"
                            >
                              <ElIcon class="animate-spin" :size="22"><Loading /></ElIcon>
                              <span class="text-xs">上传中</span>
                            </div>
                            <!-- 已有图片 -->
                            <template v-else-if="element.url">
                              <img :src="element.url" class="w-full h-full object-cover" alt="" />
                              <!-- 悬停预览提示 -->
                              <div
                                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded"
                              >
                                <ElIcon :size="22" class="text-white"><ZoomIn /></ElIcon>
                              </div>
                            </template>
                          </div>
                        </div>
                      </template>
                    </draggable>

                    <!-- 始终可见的上传槽（未满 10 张时） -->
                    <div
                      v-if="formData.screenshots.length < 10"
                      class="shrink-0 cursor-pointer overflow-hidden rounded border border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center gap-1 text-gray-400 transition-colors"
                      style="width: 100px; height: 100px"
                      @click="screenshotInputRef?.click()"
                    >
                      <ElIcon :size="24"><Plus /></ElIcon>
                      <span class="text-xs">点击上传</span>
                    </div>
                    <!-- 多选文件 input -->
                    <input
                      ref="screenshotInputRef"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      class="hidden"
                      @change="handleScreenshotFileChange"
                    />
                  </div>
                </div>
              </ElFormItem>
            </ElCol>

            <!-- 游戏视频 -->
            <ElCol :span="24">
              <ElFormItem label="游戏视频">
                <div class="w-full">
                  <template v-if="formData.videoUrl">
                    <video
                      :src="formData.videoUrl"
                      controls
                      class="max-w-full rounded-lg mb-2"
                      style="max-height: 200px"
                    />
                    <br />
                    <ElButton type="danger" size="small" plain @click="formData.videoUrl = ''"
                      >× 清除视频</ElButton
                    >
                  </template>
                  <template v-else>
                    <ElButton
                      :loading="videoUploading"
                      size="small"
                      @click="videoInputRef?.click()"
                    >
                      点击上传视频（mp4/webm，最大 500MB）
                    </ElButton>
                    <input
                      ref="videoInputRef"
                      type="file"
                      accept="video/mp4,video/webm"
                      style="display: none"
                      @change="handleVideoUpload"
                    />
                    <span class="ml-2 text-xs text-gray-400">支持 MP4 / WebM</span>
                  </template>
                </div>
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

  <!-- 截图预览器 -->
  <ElImageViewer
    v-if="previewVisible"
    :url-list="previewSrcList"
    :initial-index="previewIndex"
    @close="previewVisible = false"
  />
</template>

<script setup lang="ts">
  import { Delete, Plus, Loading, ZoomIn } from '@element-plus/icons-vue'
  // Delete 用于下载链接删除按钮
  import { ElImageViewer } from 'element-plus'
  import draggable from 'vuedraggable'
  import { uploadFile } from '@/api/upload'
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

  let screenshotIdCounter = 0
  const screenshotInputRef = ref<HTMLInputElement>()
  const videoInputRef = ref<HTMLInputElement>()
  const videoUploading = ref(false)

  // 预览状态
  const previewVisible = ref(false)
  const previewIndex = ref(0)
  const previewSrcList = computed(() => formData.screenshots.map((s) => s.url).filter(Boolean))

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
    description: '',
    screenshots: [] as { id: number; url: string; uploading?: boolean }[],
    videoUrl: ''
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

  // 打开截图预览（只对有 URL 的项生效）
  const openPreview = (index: number) => {
    const filled = formData.screenshots.filter((s) => s.url)
    const url = formData.screenshots[index]?.url
    if (!url) return
    previewIndex.value = Math.max(
      0,
      filled.findIndex((s) => s.url === url)
    )
    previewVisible.value = true
  }

  // 批量上传截图（支持多选）
  const handleScreenshotFileChange = async (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files ?? [])
    if (!files.length) return

    const available = 10 - formData.screenshots.length
    const toUpload = files.slice(0, available)
    if (toUpload.length < files.length) {
      ElMessage.warning(`最多 10 张，已截取前 ${toUpload.length} 张`)
    }

    // 先占位（显示加载动画）
    toUpload.forEach(() => {
      formData.screenshots.push({ id: ++screenshotIdCounter, url: '', uploading: true })
    })
    const startIdx = formData.screenshots.length - toUpload.length

    await Promise.all(
      toUpload.map(async (file, i) => {
        const item = formData.screenshots[startIdx + i]
        try {
          const result = await uploadFile(file, 'game-screenshot')
          item.url = result.url
        } catch (err: any) {
          ElMessage.error(err?.message ?? `第 ${i + 1} 张上传失败`)
        } finally {
          item.uploading = false
        }
      })
    )

    // 移除上传失败的项（url 仍为空）
    for (let i = formData.screenshots.length - 1; i >= 0; i--) {
      if (!formData.screenshots[i].url && !formData.screenshots[i].uploading) {
        formData.screenshots.splice(i, 1)
      }
    }

    if (screenshotInputRef.value) screenshotInputRef.value.value = ''
  }

  const removeScreenshot = (i: number) => {
    formData.screenshots.splice(i, 1)
  }

  const handleVideoUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    videoUploading.value = true
    try {
      const result = await uploadFile(file, 'game-video')
      formData.videoUrl = (result as any).url || ''
      ElMessage.success('视频上传成功')
    } catch {
      ElMessage.error('视频上传失败')
    } finally {
      videoUploading.value = false
      if (videoInputRef.value) videoInputRef.value.value = ''
    }
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
        formData.screenshots = Array.isArray(row.screenshots)
          ? row.screenshots.map((url: string) => ({ id: ++screenshotIdCounter, url }))
          : []
        formData.videoUrl = row.videoUrl || ''
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
      formData.screenshots = []
      formData.videoUrl = ''
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
      // 封面取第一张截图
      submitData.coverImage = formData.screenshots[0]?.url || ''
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
      submitData.screenshots = formData.screenshots.map((s) => s.url).filter(Boolean)
      if (formData.videoUrl.trim()) submitData.videoUrl = formData.videoUrl.trim()

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
    formData.screenshots = []
    formData.videoUrl = ''
    videoUploading.value = false
    previewVisible.value = false
  }
</script>
