<template>
  <div class="file-manager">
    <ArtTableFullScreen>
      <div class="flex h-full gap-4 p-4">
        <!-- 左侧目录树 -->
        <div class="w-44 flex-shrink-0">
          <div class="text-sm font-semibold text-gray-600 mb-2 px-2">目录</div>
          <div class="space-y-1">
            <div
              v-for="dir in DIRS"
              :key="dir.key"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-colors duration-150"
              :class="
                selectedDir === dir.key
                  ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'border-transparent text-gray-700 hover:bg-gray-50'
              "
              @click="handleDirSelect(dir.key)"
            >
              <div
                class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                :class="dir.iconBg"
              >
                <ElIcon :class="dir.iconColor" :size="16"><component :is="dir.icon" /></ElIcon>
              </div>
              <span class="text-sm font-medium flex-1 truncate">{{ dir.label }}</span>
              <span
                v-if="selectedDir === dir.key && total > 0"
                class="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium tabular-nums"
                >{{ total }}</span
              >
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="flex-1 flex flex-col min-w-0">
          <!-- 顶部工具栏 -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-base font-semibold">
              {{ currentDir?.label }}
              <span class="text-sm text-gray-400 font-normal ml-2">共 {{ total }} 个文件</span>
            </span>
            <el-upload
              :show-file-list="false"
              :accept="currentDir?.accept"
              :http-request="handleUpload"
              :disabled="uploading"
            >
              <ElButton type="primary" :loading="uploading" size="small">
                <ElIcon class="mr-1"><Upload /></ElIcon>
                上传文件
              </ElButton>
            </el-upload>
          </div>

          <!-- 文件网格 -->
          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <ElIcon class="animate-spin text-2xl text-primary"><Loading /></ElIcon>
          </div>

          <ElEmpty v-else-if="files.length === 0" description="该目录暂无文件" class="flex-1" />

          <div v-else class="flex-1 overflow-y-auto">
            <ElRow :gutter="12">
              <ElCol
                v-for="file in files"
                :key="file.key"
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
                class="mb-3"
              >
                <div
                  class="file-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow group relative"
                  @click="handlePreview(file)"
                >
                  <!-- 图片预览 -->
                  <template v-if="isImage(file.key)">
                    <div
                      class="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        :src="file.url"
                        :alt="getFileName(file.key)"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                  </template>
                  <!-- 视频占位 -->
                  <template v-else>
                    <div
                      class="aspect-square bg-gray-100 flex flex-col items-center justify-center"
                    >
                      <ElIcon class="text-3xl text-gray-400 mb-1"><VideoPlay /></ElIcon>
                      <span class="text-xs text-gray-400 px-1 text-center line-clamp-2">
                        {{ getFileName(file.key) }}
                      </span>
                    </div>
                  </template>

                  <!-- 文件信息 -->
                  <div class="p-2">
                    <p class="text-xs text-gray-600 truncate" :title="getFileName(file.key)">
                      {{ getFileName(file.key) }}
                    </p>
                    <p class="text-xs text-gray-400">{{ formatSize(file.size) }}</p>
                  </div>

                  <!-- 悬停操作 -->
                  <div
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                    @click.stop
                  >
                    <ElButton
                      size="small"
                      type="primary"
                      circle
                      :icon="CopyDocument"
                      title="复制 URL"
                      @click="handleCopyUrl(file.url)"
                    />
                    <ElButton
                      size="small"
                      type="danger"
                      circle
                      :icon="Delete"
                      title="删除"
                      @click="handleDelete(file)"
                    />
                  </div>
                </div>
              </ElCol>
            </ElRow>
          </div>

          <!-- 分页 -->
          <div v-if="total > 0" class="mt-4 flex justify-end">
            <ElPagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[50, 100, 200]"
              layout="total, sizes, prev, pager, next"
              @change="loadFiles"
            />
          </div>
        </div>
      </div>
    </ArtTableFullScreen>

    <!-- 图片预览 -->
    <ElImageViewer
      v-if="previewVisible"
      :url-list="previewUrls"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Upload,
    Loading,
    VideoPlay,
    Delete,
    CopyDocument,
    Picture,
    PictureFilled,
    Grid,
    UserFilled,
    Goods,
    Document
  } from '@element-plus/icons-vue'
  import { fetchFileList, fetchDeleteFile, uploadFile, type FileItem } from '@/api/upload'

  defineOptions({ name: 'FileManager' })

  // ── 目录配置 ────────────────────────────────────────────────
  const DIRS = [
    {
      key: 'game-covers',
      label: '游戏封面',
      uploadType: 'game-cover',
      accept: 'image/*',
      icon: Picture,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500'
    },
    {
      key: 'game-screenshots',
      label: '游戏截图',
      uploadType: 'game-screenshot',
      accept: 'image/*',
      icon: PictureFilled,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-500'
    },
    {
      key: 'game-videos',
      label: '游戏视频',
      uploadType: 'game-video',
      accept: 'video/mp4,video/webm',
      icon: VideoPlay,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500'
    },
    {
      key: 'category-icons',
      label: '分类图标',
      uploadType: 'category-icon',
      accept: 'image/*',
      icon: Grid,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500'
    },
    {
      key: 'product-covers',
      label: '商品封面',
      uploadType: 'product-cover',
      accept: 'image/*',
      icon: Goods,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-500'
    },
    {
      key: 'product-gallery',
      label: '商品图集',
      uploadType: 'product-gallery',
      accept: 'image/*',
      icon: Document,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-500'
    },
    {
      key: 'avatars',
      label: '用户头像',
      uploadType: 'avatar',
      accept: 'image/*',
      icon: UserFilled,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-500'
    }
  ]

  // ── 状态 ─────────────────────────────────────────────────────
  const selectedDir = ref(DIRS[0].key)
  const files = ref<FileItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(50)
  const loading = ref(false)
  const uploading = ref(false)
  const previewVisible = ref(false)
  const previewUrls = ref<string[]>([])
  const previewIndex = ref(0)

  const currentDir = computed(() => DIRS.find((d) => d.key === selectedDir.value))

  // ── 加载文件列表 ─────────────────────────────────────────────
  const loadFiles = async () => {
    loading.value = true
    try {
      const res = await fetchFileList(selectedDir.value, page.value, pageSize.value)
      const data = (res as any)?.data ?? res
      files.value = data.list ?? []
      total.value = data.total ?? 0
    } catch {
      ElMessage.error('加载文件列表失败')
    } finally {
      loading.value = false
    }
  }

  // ── 切换目录 ─────────────────────────────────────────────────
  const handleDirSelect = (key: string) => {
    selectedDir.value = key
    page.value = 1
    total.value = 0 // 切换目录时清零，避免残留旧数
    loadFiles()
  }

  // ── 上传 ─────────────────────────────────────────────────────
  const handleUpload = async ({ file }: { file: File }) => {
    const dir = currentDir.value
    if (!dir) return
    uploading.value = true
    try {
      await uploadFile(file, dir.uploadType)
      ElMessage.success('上传成功')
      loadFiles()
    } catch {
      ElMessage.error('上传失败')
    } finally {
      uploading.value = false
    }
  }

  // ── 预览 ─────────────────────────────────────────────────────
  const handlePreview = (file: FileItem) => {
    if (isImage(file.key)) {
      const imageFiles = files.value.filter((f) => isImage(f.key))
      previewUrls.value = imageFiles.map((f) => f.url)
      previewIndex.value = imageFiles.findIndex((f) => f.key === file.key)
      previewVisible.value = true
    } else {
      window.open(file.url, '_blank')
    }
  }

  // ── 复制 URL ─────────────────────────────────────────────────
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    ElMessage.success('URL 已复制')
  }

  // ── 删除 ─────────────────────────────────────────────────────
  const handleDelete = async (file: FileItem) => {
    await ElMessageBox.confirm(
      `确定删除文件 "${getFileName(file.key)}"？此操作不可撤销。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    try {
      await fetchDeleteFile(file.key)
      ElMessage.success('已删除')
      loadFiles()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  // ── 工具函数 ─────────────────────────────────────────────────
  const isImage = (key: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(key)

  const getFileName = (key: string) => key.split('/').pop() ?? key

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  onMounted(() => loadFiles())
</script>
