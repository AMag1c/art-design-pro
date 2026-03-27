<!-- 签到管理（游戏商城）-->
<template>
  <div class="sign-in-manage-page art-full-height">
    <!-- 数据概览 -->
    <ElRow :gutter="16" class="mb-4">
      <ElCol :span="8">
        <ElCard shadow="never" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon today"
              ><ElIcon><UserFilled /></ElIcon
            ></div>
            <div>
              <div class="stat-num">{{ stats.todayCount }}</div>
              <div class="stat-label">今日签到人数</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="never" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total"
              ><ElIcon><DataLine /></ElIcon
            ></div>
            <div>
              <div class="stat-num">{{ stats.totalCount }}</div>
              <div class="stat-label">总签到次数</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="8">
        <ElCard shadow="never" class="stat-card">
          <div class="stat-item">
            <div class="stat-icon users"
              ><ElIcon><Avatar /></ElIcon
            ></div>
            <div>
              <div class="stat-num">{{ stats.totalUsers }}</div>
              <div class="stat-label">签到用户总数</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <!-- 左列：7日奖励配置 + VIP设置 -->
      <ElCol :span="14">
        <!-- 7日连续签到奖励 -->
        <ElCard shadow="never" class="mb-4">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <ElIcon class="text-orange-400"><Calendar /></ElIcon>
                <span class="font-semibold">7日连续签到奖励</span>
              </div>
              <span class="text-xs text-gray-400">按7天为一周期循环</span>
            </div>
          </template>

          <div v-loading="configLoading">
            <!-- 预览卡片（同用户端样式） -->
            <div class="reward-preview mb-4">
              <div
                v-for="item in configList"
                :key="item.dayIndex"
                class="reward-day"
                :class="{ 'reward-day--special': item.bonusLabel }"
              >
                <div class="text-xs text-gray-400">第{{ item.dayIndex }}天</div>
                <div class="reward-coins">
                  <span class="text-yellow-500">🪙</span>
                  <span class="font-bold text-sm">{{ item.coins }}</span>
                </div>
                <div v-if="item.bonusLabel" class="reward-badge">{{ item.bonusLabel }}</div>
              </div>
            </div>

            <!-- 编辑表格 -->
            <ElTable :data="configList" border size="small">
              <ElTableColumn label="天数" width="70" align="center">
                <template #default="{ row }">
                  <span class="font-medium text-gray-600">第{{ row.dayIndex }}天</span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="基础奖励(游戏币)" width="160" align="center">
                <template #default="{ row }">
                  <ElInputNumber
                    v-model="row.coins"
                    :min="1"
                    :max="9999"
                    :precision="0"
                    size="small"
                    style="width: 120px"
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="VIP加成后" width="110" align="center">
                <template #default="{ row }">
                  <span class="text-purple-500 font-medium">
                    {{ Math.floor(row.coins * (1 + vipBonusPct / 100)) }} 币
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn label="额外说明(如：神秘礼包)" min-width="160">
                <template #default="{ row }">
                  <ElInput
                    v-model="row.bonusLabel"
                    placeholder="留空表示无"
                    size="small"
                    clearable
                  />
                </template>
              </ElTableColumn>
              <ElTableColumn label="" width="80" align="center">
                <template #default="{ row }">
                  <ElButton
                    type="primary"
                    size="small"
                    :loading="row._saving"
                    @click="saveConfig(row)"
                  >
                    保存
                  </ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElCard>

        <!-- VIP 加成设置 -->
        <ElCard shadow="never">
          <template #header>
            <div class="flex items-center gap-2">
              <ElIcon class="text-yellow-500"><GoldMedal /></ElIcon>
              <span class="font-semibold">VIP 签到加成设置</span>
            </div>
          </template>

          <ElForm label-width="130px" class="pr-4">
            <ElFormItem label="VIP加成比例">
              <div class="flex items-center gap-3">
                <ElInputNumber
                  v-model="vipBonusPct"
                  :min="0"
                  :max="500"
                  :precision="0"
                  style="width: 140px"
                />
                <span class="text-gray-500 text-sm">%</span>
                <span class="text-gray-400 text-xs">
                  （VIP用户每次签到额外获得 {{ vipBonusPct }}% 游戏币）
                </span>
              </div>
            </ElFormItem>
            <ElFormItem label="">
              <div class="text-xs text-gray-400 space-y-1">
                <div>• 设为 0 表示 VIP 无加成</div>
                <div>• 设为 50 表示 VIP 额外获得 50%（即 1.5 倍）</div>
                <div>• 设为 100 表示 VIP 获得 2 倍游戏币</div>
              </div>
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" :loading="savingVip" @click="saveVipBonus"
                >保存VIP配置</ElButton
              >
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>

      <!-- 右列：签到规则文案 -->
      <ElCol :span="10">
        <ElCard shadow="never" class="mb-4">
          <template #header>
            <div class="flex items-center gap-2">
              <ElIcon class="text-blue-500"><Document /></ElIcon>
              <span class="font-semibold">签到规则文案</span>
            </div>
          </template>

          <div class="text-xs text-gray-400 mb-3">
            以下文案将显示在用户签到页的「签到规则」卡片中（留空使用默认文案）
          </div>

          <ElForm label-width="0" v-loading="siteLoading">
            <div v-for="i in 4" :key="i" class="mb-3">
              <div class="text-xs text-gray-500 mb-1">规则 {{ i }}</div>
              <ElInput v-model="rules[i - 1]" :placeholder="defaultRules[i - 1]" size="default" />
            </div>
            <ElButton type="primary" :loading="savingRules" @click="saveRules" class="mt-2">
              保存规则文案
            </ElButton>
          </ElForm>
        </ElCard>

        <!-- 快捷入口 -->
        <ElCard shadow="never">
          <template #header>
            <span class="font-semibold">相关配置</span>
          </template>
          <div class="space-y-2">
            <div class="link-item" @click="$router.push('/game-manage/achievements')">
              <div class="flex items-center gap-2">
                <ElIcon class="text-yellow-500"><Trophy /></ElIcon>
                <div>
                  <div class="text-sm font-medium">成就管理</div>
                  <div class="text-xs text-gray-400">管理签到成就及奖励</div>
                </div>
              </div>
              <ElIcon class="text-gray-400"><ArrowRight /></ElIcon>
            </div>
            <div class="link-item" @click="$router.push('/game-manage/vip')">
              <div class="flex items-center gap-2">
                <ElIcon class="text-purple-500"><GoldMedal /></ElIcon>
                <div>
                  <div class="text-sm font-medium">VIP套餐管理</div>
                  <div class="text-xs text-gray-400">管理VIP订阅套餐</div>
                </div>
              </div>
              <ElIcon class="text-gray-400"><ArrowRight /></ElIcon>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchGetSignInConfig,
    fetchUpdateSignInConfig,
    fetchAdminGetSiteConfigs,
    fetchAdminUpdateSiteConfigs,
    fetchAdminGetSignInStats,
    type SignInConfigItem
  } from '@/api/operations'
  import {
    Calendar,
    GoldMedal,
    Document,
    Trophy,
    ArrowRight,
    UserFilled,
    DataLine,
    Avatar
  } from '@element-plus/icons-vue'

  defineOptions({ name: 'SignInManage' })

  // ── 统计 ──────────────────────────────────────────────────────
  const stats = reactive({ todayCount: 0, totalCount: 0, totalUsers: 0 })

  async function loadStats() {
    try {
      const res = await fetchAdminGetSignInStats()
      const d = (res as any)?.data ?? res
      Object.assign(stats, d)
    } catch {
      // 统计加载失败不阻断主流程，数值保持 0
    }
  }

  // ── 7日奖励配置 ───────────────────────────────────────────────
  const configLoading = ref(false)
  const configList = ref<(SignInConfigItem & { _saving?: boolean })[]>([])

  async function loadConfig() {
    configLoading.value = true
    try {
      const res = await fetchGetSignInConfig()
      configList.value = ((res as any).list ?? res ?? []).map((item: SignInConfigItem) => ({
        ...item,
        _saving: false
      }))
    } finally {
      configLoading.value = false
    }
  }

  async function saveConfig(row: SignInConfigItem & { _saving?: boolean }) {
    row._saving = true
    try {
      await fetchUpdateSignInConfig({
        dayIndex: row.dayIndex,
        coins: row.coins,
        bonusLabel: row.bonusLabel
      })
    } finally {
      row._saving = false
    }
  }

  // ── 站点配置（VIP加成 + 规则文案） ───────────────────────────
  const siteLoading = ref(false)
  const savingVip = ref(false)
  const savingRules = ref(false)
  const vipBonusPct = ref(50)
  const rules = ref(['', '', '', ''])

  const defaultRules = [
    '每日签到可获得游戏币奖励，连续签到奖励更丰厚',
    '连续签到7天可获得神秘礼包，中断后重新计算',
    'VIP用户签到可获得额外加成游戏币奖励',
    '每日0点(UTC)刷新签到状态，请及时签到'
  ]

  async function loadSiteConfig() {
    siteLoading.value = true
    try {
      const res = await fetchAdminGetSiteConfigs()
      const list = (res as any).list ?? res ?? []
      const map: Record<string, string> = {}
      list.forEach((item: any) => {
        map[item.configKey] = item.configValue
      })
      if (map['sign_in_vip_bonus_pct']) {
        vipBonusPct.value = parseInt(map['sign_in_vip_bonus_pct']) || 50
      }
      for (let i = 0; i < 4; i++) {
        rules.value[i] = map[`sign_in_rule_${i + 1}`] ?? ''
      }
    } finally {
      siteLoading.value = false
    }
  }

  async function saveVipBonus() {
    savingVip.value = true
    try {
      await fetchAdminUpdateSiteConfigs([
        { key: 'sign_in_vip_bonus_pct', value: String(vipBonusPct.value) }
      ])
    } finally {
      savingVip.value = false
    }
  }

  async function saveRules() {
    savingRules.value = true
    try {
      const configs = rules.value.map((v, i) => ({
        key: `sign_in_rule_${i + 1}`,
        value: v
      }))
      await fetchAdminUpdateSiteConfigs(configs)
    } finally {
      savingRules.value = false
    }
  }

  onMounted(() => {
    loadStats()
    loadConfig()
    loadSiteConfig()
  })
</script>

<style lang="scss" scoped>
  .sign-in-manage-page {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .stat-card {
    :deep(.el-card__body) {
      padding: 16px 20px;
    }
  }

  .stat-item {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 22px;
    border-radius: 12px;

    &.today {
      color: #409eff;
      background: #ecf5ff;
    }

    &.total {
      color: #67c23a;
      background: #f0f9eb;
    }

    &.users {
      color: #e6a23c;
      background: #fdf6ec;
    }
  }

  .stat-num {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    color: var(--el-text-color-primary);
  }

  .stat-label {
    margin-top: 4px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .reward-preview {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }

  .reward-day {
    padding: 8px 4px;
    text-align: center;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &--special {
      background: #fdf6ec;
      border-color: #e6a23c;
    }
  }

  .reward-coins {
    display: flex;
    gap: 2px;
    align-items: center;
    justify-content: center;
    margin: 4px 0;
  }

  .reward-badge {
    padding: 1px 4px;
    overflow: hidden;
    font-size: 10px;
    color: #e6a23c;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: rgb(230 162 60 / 12%);
    border-radius: 4px;
  }

  .link-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    cursor: pointer;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-5);
    }
  }
</style>
