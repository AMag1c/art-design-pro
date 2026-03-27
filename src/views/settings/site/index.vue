<!-- 站点设置 -->
<template>
  <div class="site-settings-page art-full-height">
    <div v-loading="loading" class="settings-body">
      <!-- 通用设置 -->
      <ElCard shadow="never" class="mb-4">
        <template #header>
          <div class="flex items-center gap-2">
            <ElIcon class="text-primary"><Setting /></ElIcon>
            <span class="font-semibold">通用设置</span>
          </div>
        </template>
        <ElForm label-width="140px">
          <ElFormItem label="站点名称">
            <ElInput
              v-model="configMap.site_name"
              placeholder="MagicShop"
              style="max-width: 400px"
            />
            <div class="text-xs text-gray-400 mt-1">显示在浏览器标签和页面头部</div>
          </ElFormItem>
          <ElFormItem label="站点公告">
            <ElInput
              v-model="configMap.site_announcement"
              type="textarea"
              :rows="3"
              placeholder="留空则不显示公告"
              style="max-width: 600px"
            />
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 法律合规 -->
      <ElCard shadow="never" class="mb-4">
        <template #header>
          <div class="flex items-center gap-2">
            <ElIcon class="text-primary"><Document /></ElIcon>
            <span class="font-semibold">法律合规</span>
          </div>
        </template>
        <ElForm label-width="140px">
          <ElFormItem label="服务条款链接">
            <ElInput
              v-model="configMap.terms_url"
              placeholder="https://example.com/terms"
              style="max-width: 500px"
            />
            <div class="text-xs text-gray-400 mt-1">用户端 VIP 订阅页会展示此链接</div>
          </ElFormItem>
          <ElFormItem label="隐私政策链接">
            <ElInput
              v-model="configMap.privacy_url"
              placeholder="https://example.com/privacy"
              style="max-width: 500px"
            />
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 客服信息 -->
      <ElCard shadow="never" class="mb-4">
        <template #header>
          <div class="flex items-center gap-2">
            <ElIcon class="text-primary"><Service /></ElIcon>
            <span class="font-semibold">客服信息</span>
          </div>
        </template>
        <ElForm label-width="140px">
          <ElFormItem label="客服QQ">
            <ElInput
              v-model="configMap.customer_service_qq"
              placeholder="留空不显示"
              style="max-width: 300px"
            />
          </ElFormItem>
          <ElFormItem label="客服微信">
            <ElInput
              v-model="configMap.customer_service_wechat"
              placeholder="留空不显示"
              style="max-width: 300px"
            />
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 签到配置 -->
      <ElCard shadow="never" class="mb-4">
        <template #header>
          <div class="flex items-center gap-2">
            <ElIcon class="text-primary"><Calendar /></ElIcon>
            <span class="font-semibold">签到配置</span>
          </div>
        </template>
        <ElForm label-width="140px">
          <ElFormItem label="VIP签到加成%">
            <ElInputNumber
              v-model="vipBonusPct"
              :min="0"
              :max="500"
              :precision="0"
              style="width: 180px"
            />
            <span class="ml-2 text-gray-500 text-sm"
              >% （VIP用户每次签到额外获得此比例游戏币）</span
            >
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 保存按钮 -->
      <div class="flex justify-end mt-4">
        <ElButton type="primary" :loading="saving" @click="handleSave" size="large">
          保存所有设置
        </ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Setting, Document, Service, Calendar } from '@element-plus/icons-vue'
  import {
    fetchAdminGetSiteConfigs,
    fetchAdminUpdateSiteConfigs,
    type SiteConfigItem
  } from '@/api/operations'

  defineOptions({ name: 'SiteSettings' })

  const loading = ref(false)
  const saving = ref(false)

  const configMap = reactive<Record<string, string>>({
    site_name: '',
    site_announcement: '',
    terms_url: '',
    privacy_url: '',
    customer_service_qq: '',
    customer_service_wechat: '',
    sign_in_vip_bonus_pct: '50'
  })

  const vipBonusPct = computed({
    get: () => parseInt(configMap.sign_in_vip_bonus_pct || '50', 10),
    set: (v: number) => {
      configMap.sign_in_vip_bonus_pct = String(v)
    }
  })

  async function loadConfigs() {
    loading.value = true
    try {
      const res = await fetchAdminGetSiteConfigs()
      const list: SiteConfigItem[] = (res as any).list ?? res ?? []
      list.forEach((item) => {
        if (item.configKey in configMap) {
          configMap[item.configKey] = item.configValue
        }
      })
    } finally {
      loading.value = false
    }
  }

  async function handleSave() {
    saving.value = true
    try {
      const configs = Object.entries(configMap).map(([key, value]) => ({ key, value }))
      await fetchAdminUpdateSiteConfigs(configs)
    } finally {
      saving.value = false
    }
  }

  onMounted(loadConfigs)
</script>

<style lang="scss" scoped>
  .site-settings-page {
    padding: 0;
  }

  .settings-body {
    max-width: 900px;
  }
</style>
