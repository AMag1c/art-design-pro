<!-- 演示数据管理 -->
<template>
  <div class="demo-data-page art-full-height">
    <ElCard shadow="never" class="mb-4">
      <template #header>
        <div class="flex items-center gap-2">
          <ElIcon color="#f59e0b"><MagicStick /></ElIcon>
          <span class="font-semibold">演示数据管理</span>
        </div>
      </template>

      <!-- 状态区 -->
      <div class="status-section mb-6">
        <div
          class="flex items-center gap-4 p-4 rounded-lg"
          :class="status?.seeded ? 'bg-green-50' : 'bg-gray-50'"
        >
          <div class="status-icon">
            <ElIcon size="36" :color="status?.seeded ? '#22c55e' : '#9ca3af'">
              <CircleCheckFilled v-if="status?.seeded" />
              <CircleCloseFilled v-else />
            </ElIcon>
          </div>
          <div>
            <div
              class="font-semibold text-base"
              :class="status?.seeded ? 'text-green-700' : 'text-gray-500'"
            >
              {{ status?.seeded ? '演示数据已加载' : '未加载演示数据' }}
            </div>
            <div class="text-sm text-gray-400 mt-0.5" v-if="status?.seeded">
              加载时间：{{ status.seededAt }}
            </div>
            <div class="text-sm text-gray-400 mt-0.5" v-else>
              点击「加载演示数据」填充商品商店与游戏商城的示例内容
            </div>
          </div>
          <div class="ml-auto">
            <ElTag :type="status?.seeded ? 'success' : 'info'" effect="plain" size="large">
              {{ status?.seeded ? '已加载' : '未加载' }}
            </ElTag>
          </div>
        </div>
      </div>

      <!-- 数据说明 -->
      <ElDescriptions title="演示数据内容" :column="2" border class="mb-6">
        <ElDescriptionsItem label="商品分类">
          <ElTag type="primary">6 个分类</ElTag>
          <span class="ml-2 text-gray-400 text-sm"
            >流媒体账号、游戏激活码、软件授权、会员订阅、虚拟账号、礼品卡</span
          >
        </ElDescriptionsItem>
        <ElDescriptionsItem label="商品数量">
          <ElTag type="primary">12 件商品</ElTag>
          <span class="ml-2 text-gray-400 text-sm">Netflix、Spotify、Steam、Adobe、ChatGPT 等</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="卡密数量">
          <ElTag type="warning">60 条卡密</ElTag>
          <span class="ml-2 text-gray-400 text-sm">每件商品 5 条演示卡密，可完整测试购买流程</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="游戏分类">
          <ElTag type="primary">7 个分类</ElTag>
          <span class="ml-2 text-gray-400 text-sm">动作冒险、模拟经营、策略战棋、角色扮演等</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="游戏数量">
          <ElTag type="primary">8 款游戏</ElTag>
          <span class="ml-2 text-gray-400 text-sm"
            >星际裂变、软盘骑士、赛博朋克 2077、双影奇境等</span
          >
        </ElDescriptionsItem>
        <ElDescriptionsItem label="数据特性">
          <ElTag type="success">安全</ElTag>
          <span class="ml-2 text-gray-400 text-sm"
            >精确追踪 ID，清除时仅删除演示数据，不影响真实数据</span
          >
        </ElDescriptionsItem>
      </ElDescriptions>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <ElButton
          type="primary"
          :loading="seeding"
          :disabled="status?.seeded || loading"
          @click="handleSeed"
          size="large"
        >
          <ElIcon class="mr-1"><Download /></ElIcon>
          加载演示数据
        </ElButton>
        <ElButton
          type="danger"
          :loading="clearing"
          :disabled="!status?.seeded || loading"
          @click="handleClear"
          size="large"
        >
          <ElIcon class="mr-1"><Delete /></ElIcon>
          清除演示数据
        </ElButton>
        <ElButton :loading="loading" @click="fetchStatus" size="large">
          <ElIcon class="mr-1"><Refresh /></ElIcon>
          刷新状态
        </ElButton>
      </div>
    </ElCard>

    <!-- 使用说明 -->
    <ElCard shadow="never">
      <template #header>
        <span class="font-semibold">使用说明</span>
      </template>
      <ElAlert
        title="演示数据用于展示和测试，不影响系统正常运行"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      />
      <div class="space-y-2 text-sm text-gray-600">
        <div class="flex items-start gap-2">
          <ElIcon color="#3b82f6" class="mt-0.5 flex-shrink-0"><InfoFilled /></ElIcon>
          <span
            ><strong>加载演示数据</strong
            >：将商品商店与游戏商城填充示例内容，前端页面立即可见，适合演示和开发调试</span
          >
        </div>
        <div class="flex items-start gap-2">
          <ElIcon color="#ef4444" class="mt-0.5 flex-shrink-0"><WarningFilled /></ElIcon>
          <span
            ><strong>清除演示数据</strong
            >：精确删除所有演示数据（商品/卡密/游戏等），不影响管理员账号、签到配置等系统数据</span
          >
        </div>
        <div class="flex items-start gap-2">
          <ElIcon color="#22c55e" class="mt-0.5 flex-shrink-0"><CircleCheckFilled /></ElIcon>
          <span
            ><strong>启动参数</strong>：运行
            <ElTag size="small" type="info">go run main.go --demo</ElTag>
            可在服务启动时自动加载演示数据</span
          >
        </div>
        <div class="flex items-start gap-2">
          <ElIcon color="#f59e0b" class="mt-0.5 flex-shrink-0"><MagicStick /></ElIcon>
          <span
            ><strong>幂等保护</strong
            >：重复点击「加载」会提示已加载，清除后可重新加载，支持多次循环</span
          >
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import {
    MagicStick,
    CircleCheckFilled,
    CircleCloseFilled,
    Download,
    Delete,
    Refresh,
    InfoFilled,
    WarningFilled
  } from '@element-plus/icons-vue'
  import { fetchDemoStatus, fetchSeedDemo, fetchClearDemo, type DemoStatus } from '@/api/operations'

  const status = ref<DemoStatus | null>(null)
  const loading = ref(false)
  const seeding = ref(false)
  const clearing = ref(false)

  async function fetchStatus() {
    loading.value = true
    try {
      status.value = await fetchDemoStatus()
    } finally {
      loading.value = false
    }
  }

  async function handleSeed() {
    try {
      await ElMessageBox.confirm(
        '即将加载演示数据，包含商品分类、商品、卡密和游戏数据，是否继续？',
        '加载演示数据',
        { type: 'warning', confirmButtonText: '确认加载', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    seeding.value = true
    try {
      await fetchSeedDemo()
      await fetchStatus()
    } finally {
      seeding.value = false
    }
  }

  async function handleClear() {
    try {
      await ElMessageBox.confirm('即将清除全部演示数据，此操作不可逆，是否继续？', '清除演示数据', {
        type: 'error',
        confirmButtonText: '确认清除',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    clearing.value = true
    try {
      await fetchClearDemo()
      await fetchStatus()
    } finally {
      clearing.value = false
    }
  }

  onMounted(fetchStatus)
</script>

<style scoped>
  .demo-data-page {
    padding: 16px;
  }

  .status-section .status-icon {
    flex-shrink: 0;
  }

  :deep(.el-descriptions__title) {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }
</style>
