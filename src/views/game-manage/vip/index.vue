<!-- VIP套餐管理 -->
<template>
  <div class="vip-plans-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader :loading="loading" @refresh="loadPlans">
        <template #left>
          <ElButton type="primary" @click="openDialog('add')" v-ripple>
            <ElIcon><Plus /></ElIcon>
            新增套餐
          </ElButton>
        </template>
      </ArtTableHeader>

      <ElTable :data="planList" v-loading="loading" border stripe row-key="id">
        <ElTableColumn prop="planKey" label="套餐标识" width="120" />
        <ElTableColumn label="套餐名称" min-width="140">
          <template #default="{ row }">
            <span class="font-medium">{{ row.name }}</span>
            <ElTag v-if="row.isRecommended" type="warning" size="small" class="ml-1">推荐</ElTag>
            <ElTag v-if="row.isHot" type="danger" size="small" class="ml-1">热门</ElTag>
            <ElTag v-if="row.isPermanent" type="info" size="small" class="ml-1">永久</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="等级" width="110">
          <template #default="{ row }">
            <ElTag :type="LEVEL_TYPE[row.level] || 'info'" size="small">
              Lv{{ row.level }} {{ row.levelName }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="价格" width="160">
          <template #default="{ row }">
            <span class="text-red-500 font-bold">¥{{ (row.price / 100).toFixed(2) }}</span>
            <span
              v-if="row.originalPrice && row.originalPrice !== row.price"
              class="text-gray-400 line-through text-xs ml-1"
            >
              ¥{{ (row.originalPrice / 100).toFixed(2) }}
            </span>
            <span v-if="row.discountRate < 100" class="text-orange-500 text-xs ml-1">
              {{ (row.discountRate / 10).toFixed(1) }}折
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="有效天数" width="100">
          <template #default="{ row }">
            {{ row.isPermanent ? '永久' : `${row.durationDays}天` }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="90">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.enabled"
              @change="toggleEnabled(row)"
              :loading="row._switching"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sortOrder" label="排序" width="80" />
        <ElTableColumn label="操作" width="140" fixed="right">
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
      :title="dialogType === 'add' ? '新增VIP套餐' : '编辑VIP套餐'"
      width="600px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="套餐标识" prop="planKey">
              <ElInput
                v-model="form.planKey"
                placeholder="如 monthly"
                :disabled="dialogType === 'edit'"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="套餐名称" prop="name">
              <ElInput v-model="form.name" placeholder="如 月度会员" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="VIP等级" prop="level">
              <ElSelect v-model="form.level" style="width: 100%">
                <ElOption :value="1" label="Lv1 白银会员" />
                <ElOption :value="2" label="Lv2 黄金会员" />
                <ElOption :value="3" label="Lv3 钻石会员" />
                <ElOption :value="4" label="Lv4 至尊会员" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="等级名称" prop="levelName">
              <ElInput v-model="form.levelName" placeholder="如 黄金会员" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="价格(分)" prop="price">
              <ElInputNumber v-model="form.price" :min="0" :precision="0" style="width: 100%" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="原价(分)">
              <ElInputNumber
                v-model="form.originalPrice"
                :min="0"
                :precision="0"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="有效天数" prop="durationDays">
              <ElInputNumber
                v-model="form.durationDays"
                :min="1"
                :precision="0"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="折扣率%" prop="discountRate">
              <ElInputNumber
                v-model="form.discountRate"
                :min="1"
                :max="100"
                :precision="0"
                style="width: 100%"
              >
                <template #suffix>%</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="套餐描述">
          <ElInput v-model="form.description" type="textarea" :rows="2" placeholder="一句话介绍" />
        </ElFormItem>

        <ElFormItem label="特权列表">
          <div class="w-full">
            <div v-for="(feat, idx) in form.featuresArr" :key="idx" class="flex gap-2 mb-2">
              <ElInput v-model="form.featuresArr[idx]" placeholder="输入特权说明" />
              <ElButton :icon="Minus" circle @click="removeFeature(idx)" />
            </div>
            <ElButton type="dashed" @click="addFeature" :icon="Plus" size="small"
              >添加特权</ElButton
            >
          </div>
        </ElFormItem>

        <ElRow :gutter="16">
          <ElCol :span="8">
            <ElFormItem label="是否永久">
              <ElSwitch v-model="form.isPermanent" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="推荐套餐">
              <ElSwitch v-model="form.isRecommended" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="热门套餐">
              <ElSwitch v-model="form.isHot" />
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
    fetchAdminGetVipPlans,
    fetchAdminCreateVipPlan,
    fetchAdminUpdateVipPlan,
    fetchAdminDeleteVipPlan,
    type VipPlanItem
  } from '@/api/operations'
  import { Plus, Minus } from '@element-plus/icons-vue'
  import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'VipPlansManage' })

  const LEVEL_TYPE: Record<number, 'info' | 'warning' | 'primary' | 'success' | 'danger'> = {
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'danger'
  }

  const loading = ref(false)
  const planList = ref<(VipPlanItem & { _switching?: boolean })[]>([])

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const editId = ref<number>(0)

  const defaultForm = () => ({
    planKey: '',
    name: '',
    level: 1,
    levelName: '',
    price: 0,
    originalPrice: 0,
    durationDays: 30,
    description: '',
    featuresArr: [''] as string[],
    isPermanent: false,
    isRecommended: false,
    isHot: false,
    discountRate: 100,
    sortOrder: 0,
    enabled: true
  })

  const form = reactive(defaultForm())

  const rules: FormRules = {
    planKey: [{ required: true, message: '请输入套餐标识', trigger: 'blur' }],
    name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
    level: [{ required: true, message: '请选择VIP等级', trigger: 'change' }],
    levelName: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
    price: [{ required: true, type: 'number', min: 0, message: '请输入价格', trigger: 'blur' }],
    durationDays: [
      { required: true, type: 'number', min: 1, message: '请输入有效天数', trigger: 'blur' }
    ],
    discountRate: [
      { required: true, type: 'number', min: 1, max: 100, message: '折扣率1-100', trigger: 'blur' }
    ]
  }

  async function loadPlans() {
    loading.value = true
    try {
      const res = await fetchAdminGetVipPlans()
      planList.value = (res as any).list ?? res ?? []
    } finally {
      loading.value = false
    }
  }

  function openDialog(type: 'add' | 'edit', row?: VipPlanItem) {
    dialogType.value = type
    Object.assign(form, defaultForm())
    if (type === 'edit' && row) {
      editId.value = row.id
      Object.assign(form, {
        planKey: row.planKey,
        name: row.name,
        level: row.level,
        levelName: row.levelName,
        price: row.price,
        originalPrice: row.originalPrice,
        durationDays: row.durationDays,
        description: row.description,
        featuresArr: Array.isArray(row.features) && row.features.length ? [...row.features] : [''],
        isPermanent: row.isPermanent,
        isRecommended: row.isRecommended,
        isHot: row.isHot,
        discountRate: row.discountRate,
        sortOrder: row.sortOrder,
        enabled: row.enabled
      })
    }
    dialogVisible.value = true
  }

  function addFeature() {
    form.featuresArr.push('')
  }

  function removeFeature(idx: number) {
    form.featuresArr.splice(idx, 1)
    if (form.featuresArr.length === 0) form.featuresArr.push('')
  }

  async function handleSubmit() {
    await formRef.value?.validate()
    submitting.value = true
    try {
      const payload = {
        planKey: form.planKey,
        name: form.name,
        level: form.level,
        levelName: form.levelName,
        price: form.price,
        originalPrice: form.originalPrice,
        durationDays: form.durationDays,
        description: form.description,
        features: form.featuresArr.filter((f) => f.trim()),
        isPermanent: form.isPermanent,
        isRecommended: form.isRecommended,
        isHot: form.isHot,
        discountRate: form.discountRate,
        sortOrder: form.sortOrder,
        enabled: form.enabled
      }
      if (dialogType.value === 'add') {
        await fetchAdminCreateVipPlan(payload)
      } else {
        await fetchAdminUpdateVipPlan(editId.value, payload)
      }
      dialogVisible.value = false
      await loadPlans()
    } finally {
      submitting.value = false
    }
  }

  async function toggleEnabled(row: VipPlanItem & { _switching?: boolean }) {
    row._switching = true
    try {
      await fetchAdminUpdateVipPlan(row.id, { ...row, enabled: row.enabled })
    } catch {
      row.enabled = !row.enabled
    } finally {
      row._switching = false
    }
  }

  async function handleDelete(row: VipPlanItem) {
    await ElMessageBox.confirm(`确定删除套餐「${row.name}」？`, '删除确认', { type: 'warning' })
    await fetchAdminDeleteVipPlan(row.id)
    await loadPlans()
  }

  onMounted(loadPlans)
</script>

<style lang="scss" scoped>
  .vip-plans-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
