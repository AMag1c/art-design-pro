<template>
  <div
    class="relative cursor-pointer overflow-hidden rounded border border-dashed border-gray-300 hover:border-primary"
    :style="{ width: props.width ?? '120px', height: props.height ?? '120px' }"
    @click="inputRef?.click()"
  >
    <!-- 已有图片 + 悬停更换遮罩 -->
    <template v-if="modelValue && !uploading">
      <img :src="modelValue" class="h-full w-full object-cover" alt="preview" />
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
      >
        <span class="text-sm text-white">更换图片</span>
      </div>
    </template>

    <!-- 上传中 -->
    <div
      v-else-if="uploading"
      class="flex h-full flex-col items-center justify-center gap-1 text-gray-400"
    >
      <ElIcon class="animate-spin" :size="24"><Loading /></ElIcon>
      <span class="text-xs">上传中...</span>
    </div>

    <!-- 无图占位 -->
    <div v-else class="flex h-full flex-col items-center justify-center gap-1 text-gray-400">
      <ElIcon :size="24"><Plus /></ElIcon>
      <span class="text-xs">点击上传</span>
    </div>

    <!-- 隐藏 file input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { Plus, Loading } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { ref } from 'vue'
  import { uploadFile } from '@/api/upload'

  defineOptions({ name: 'ImageUpload' })

  const props = defineProps<{
    modelValue?: string
    type: string
    width?: string
    height?: string
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const inputRef = ref<HTMLInputElement>()
  const uploading = ref(false)

  const handleFileChange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return

    uploading.value = true
    try {
      const result = await uploadFile(file, props.type)
      emit('update:modelValue', result.url)
    } catch (err: any) {
      ElMessage.error(err?.message ?? '上传失败')
    } finally {
      uploading.value = false
      // 清空 input 允许重复选择同一文件
      if (inputRef.value) inputRef.value.value = ''
    }
  }
</script>
