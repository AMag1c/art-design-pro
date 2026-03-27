<!-- 成就管理 -->
<template>
  <div class="achievements-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" @refresh="loadAchievements">
        <template #left>
          <ElButton type="primary" @click="openDialog('add')" v-ripple>
            <ElIcon><Plus /></ElIcon>
            新增成就
          </ElButton>
        </template>
      </ArtTableHeader>

      <ElTable :data="list" v-loading="loading" border stripe row-key="id">
        <ElTableColumn prop="name" label="成就名称" width="130" />
        <ElTableColumn prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="类型" width="140">
          <template #default="{ row }">
            <ElTag :type="TYPE_CONFIG[row.type]?.tagType || 'info'" size="small">
              {{ TYPE_CONFIG[row.type]?.label || row.type }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="目标" width="90" align="center">
          <template #default="{ row }">
            <span class="font-bold text-primary">{{ row.threshold }}</span>
            <span class="text-xs text-gray-400 ml-0.5">天</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="奖励" width="110" align="center">
          <template #default="{ row }">
            <span class="text-orange-500 font-medium">{{ row.rewardCoins }} 币</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sortOrder" label="排序" width="70" align="center" />
        <ElTableColumn label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.enabled"
              @change="toggleEnabled(row)"
              :loading="row._switching"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ArtButtonTable type="edit" title="编辑" @click="openDialog('edit', row)" />
              <ArtButtonTable type="delete" title="删除" @click="handleDelete(row)" />
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增成就' : '编辑成就'"
      width="500px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px">
        <ElFormItem label="成就名称" prop="name">
          <ElInput v-model="form.name" placeholder="如 初次签到" />
        </ElFormItem>
        <ElFormItem label="成就描述" prop="description">
          <ElInput v-model="form.description" placeholder="如 完成第一次签到" />
        </ElFormItem>
        <ElFormItem label="图标标识">
          <ElSelect v-model="form.iconKey" placeholder="选择图标" style="width: 100%">
            <ElOption
              v-for="icon in ICON_OPTIONS"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="成就类型" prop="type">
          <ElSelect v-model="form.type" style="width: 100%">
            <ElOption
              v-for="(cfg, key) in TYPE_CONFIG"
              :key="key"
              :label="cfg.label"
              :value="key"
            />
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="目标天数" prop="threshold">
              <ElInputNumber v-model="form.threshold" :min="1" :precision="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="奖励游戏币">
              <ElInputNumber
                v-model="form.rewardCoins"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="排序">
              <ElInputNumber v-model="form.sortOrder" :min="0" :precision="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="启用">
              <ElSwitch v-model="form.enabled" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import {
    fetchAdminGetAchievements,
    fetchAdminCreateAchievement,
    fetchAdminUpdateAchievement,
    fetchAdminDeleteAchievement,
    type AchievementItem,
    type AchievementType
  } from '@/api/operations'
  import { Plus } from '@element-plus/icons-vue'
  import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'AchievementsManage' })

  const TYPE_CONFIG: Record<
    AchievementType,
    { label: string; tagType: 'info' | 'warning' | 'primary' | 'success' | 'danger' }
  > = {
    total_days: { label: '累计签到天数', tagType: 'primary' },
    continuous_days: { label: '连续签到天数', tagType: 'warning' },
    monthly_days: { label: '当月签到天数', tagType: 'success' }
  }

  const ICON_OPTIONS = [
    { label: '⭐ 星星 (star)', value: 'star' },
    { label: '🔥 火焰 (flame)', value: 'flame' },
    { label: '📅 日历 (calendar)', value: 'calendar' },
    { label: '🏆 奖杯 (trophy)', value: 'trophy' },
    { label: '👑 皇冠 (crown)', value: 'crown' },
    { label: '💎 钻石 (diamond)', value: 'diamond' },
    { label: '🎯 目标 (target)', value: 'target' }
  ]

  const loading = ref(false)
  const list = ref<(AchievementItem & { _switching?: boolean })[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const editId = ref(0)

  const defaultForm = () => ({
    name: '',
    description: '',
    iconKey: 'star',
    type: 'total_days' as AchievementType,
    threshold: 1,
    rewardCoins: 0,
    sortOrder: 0,
    enabled: true
  })

  const form = reactive(defaultForm())

  const rules: FormRules = {
    name: [{ required: true, message: '请输入成就名称', trigger: 'blur' }],
    description: [{ required: true, message: '请输入成就描述', trigger: 'blur' }],
    type: [{ required: true, message: '请选择成就类型', trigger: 'change' }],
    threshold: [
      { required: true, type: 'number', min: 1, message: '目标天数至少为1', trigger: 'blur' }
    ]
  }

  async function loadAchievements() {
    loading.value = true
    try {
      const res = await fetchAdminGetAchievements()
      list.value = ((res as any).list ?? res ?? []).map((item: AchievementItem) => ({
        ...item,
        _switching: false
      }))
    } finally {
      loading.value = false
    }
  }

  function openDialog(type: 'add' | 'edit', row?: AchievementItem) {
    dialogType.value = type
    Object.assign(form, defaultForm())
    if (type === 'edit' && row) {
      editId.value = row.id
      Object.assign(form, {
        name: row.name,
        description: row.description,
        iconKey: row.iconKey,
        type: row.type,
        threshold: row.threshold,
        rewardCoins: row.rewardCoins,
        sortOrder: row.sortOrder,
        enabled: row.enabled
      })
    }
    dialogVisible.value = true
  }

  async function handleSubmit() {
    await formRef.value?.validate()
    submitting.value = true
    try {
      const payload = { ...form }
      if (dialogType.value === 'add') {
        await fetchAdminCreateAchievement(payload)
      } else {
        await fetchAdminUpdateAchievement(editId.value, payload)
      }
      dialogVisible.value = false
      await loadAchievements()
    } finally {
      submitting.value = false
    }
  }

  async function toggleEnabled(row: AchievementItem & { _switching?: boolean }) {
    row._switching = true
    try {
      await fetchAdminUpdateAchievement(row.id, { ...row, enabled: row.enabled })
    } catch {
      row.enabled = !row.enabled
    } finally {
      row._switching = false
    }
  }

  async function handleDelete(row: AchievementItem) {
    await ElMessageBox.confirm(`确定删除成就「${row.name}」？`, '删除确认', { type: 'warning' })
    await fetchAdminDeleteAchievement(row.id)
    await loadAchievements()
  }

  onMounted(loadAchievements)
</script>

<style lang="scss" scoped>
  .achievements-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
