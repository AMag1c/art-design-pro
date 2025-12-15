<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="userName">
        <ElInput
          v-model="formData.userName"
          placeholder="请输入用户名"
          :disabled="dialogType === 'edit'"
        />
      </ElFormItem>

      <!-- 密码输入（新增必填，编辑可选） -->
      <ElFormItem label="密码" prop="password">
        <ElInput
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="dialogType === 'add' ? '请输入密码（默认：123456）' : '留空则不修改密码'"
          clearable
        >
          <template #suffix>
            <ElIcon class="cursor-pointer" @click="showPassword = !showPassword">
              <component :is="showPassword ? View : Hide" />
            </ElIcon>
          </template>
        </ElInput>
        <div v-if="dialogType === 'add'" style="margin-top: 4px; font-size: 12px; color: #909399">
          建议：密码长度6-20位，包含字母和数字
        </div>
      </ElFormItem>

      <ElFormItem label="昵称" prop="nickName">
        <ElInput v-model="formData.nickName" placeholder="请输入昵称" />
      </ElFormItem>

      <ElFormItem label="邮箱" prop="userEmail">
        <ElInput v-model="formData.userEmail" placeholder="请输入邮箱（可选）" clearable />
      </ElFormItem>

      <ElFormItem label="手机号" prop="userPhone">
        <ElInput
          v-model="formData.userPhone"
          placeholder="请输入手机号（可选）"
          maxlength="11"
          clearable
        />
      </ElFormItem>

      <ElFormItem label="性别" prop="userGender">
        <ElRadioGroup v-model="formData.userGender">
          <ElRadio value="male">男</ElRadio>
          <ElRadio value="female">女</ElRadio>
          <ElRadio value="other">其他</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="角色" prop="roleIds">
        <ElSelect
          v-model="formData.roleIds"
          multiple
          placeholder="请选择角色"
          style="width: 100%"
          clearable
        >
          <ElOption
            v-for="role in roleList"
            :key="role.roleId"
            :value="role.roleId"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio value="1">活跃</ElRadio>
          <ElRadio value="2">非活跃</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">
          {{ dialogType === 'add' ? '确定' : '保存' }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { View, Hide } from '@element-plus/icons-vue'
  import { fetchGetRoleList, fetchCreateUser, fetchUpdateUser } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<Api.SystemManage.RoleListItem[]>([])
  const submitting = ref(false)
  const showPassword = ref(false)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    userName: '',
    password: '123456',
    nickName: '',
    userEmail: '',
    userPhone: '',
    userGender: 'male',
    roleIds: [] as number[],
    status: '1',
    remark: ''
  })

  // 动态验证规则（新增和编辑有所不同）
  const rules = computed<FormRules>(() => {
    const baseRules: FormRules = {
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' }
      ],
      nickName: [{ max: 50, message: '昵称最多50个字符', trigger: 'blur' }],
      userEmail: [
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
        { max: 100, message: '邮箱最多100个字符', trigger: 'blur' }
      ],
      userPhone: [
        {
          pattern: /^1[3-9]\d{9}$/,
          message: '请输入正确的11位手机号',
          trigger: 'blur'
        }
      ],
      userGender: [{ required: true, message: '请选择性别', trigger: 'change' }],
      roleIds: [
        {
          type: 'array',
          required: true,
          message: '请至少选择一个角色',
          trigger: 'change'
        }
      ],
      status: [{ required: true, message: '请选择状态', trigger: 'change' }],
      remark: [{ max: 200, message: '备注最多200个字符', trigger: 'blur' }]
    }

    // 密码验证规则：新增必填，编辑可选
    if (dialogType.value === 'add') {
      baseRules.password = [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }
      ]
    } else {
      baseRules.password = [{ min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }]
    }

    return baseRules
  })

  /**
   * 加载角色列表（只在第一次或角色为空时加载）
   */
  const loadRoleList = async () => {
    // 如果已经有角色列表，不重复加载
    if (roleList.value.length > 0) {
      return
    }

    try {
      const res = await fetchGetRoleList({
        current: 1,
        size: 100,
        enabled: true
      })
      roleList.value = res.records || []
    } catch (error) {
      console.error('加载角色列表失败:', error)
      ElMessage.warning('加载角色列表失败')
    }
  }

  /**
   * 初始化表单数据
   */
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    if (isEdit && row) {
      // 编辑模式
      const roleIds =
        Array.isArray(row.userRoles) && row.userRoles.length > 0
          ? roleList.value
              .filter((role) => row.userRoles?.includes(role.roleCode))
              .map((role) => role.roleId)
          : []

      Object.assign(formData, {
        userName: row.userName || '',
        password: '', // 编辑时密码留空，表示不修改
        nickName: row.nickName || '',
        userEmail: row.userEmail || '',
        userPhone: row.userPhone || '',
        userGender: row.userGender || 'male',
        roleIds: roleIds,
        status: row.status || '1',
        remark: ''
      })
    } else {
      // 新增模式
      Object.assign(formData, {
        userName: '',
        password: '123456',
        nickName: '',
        userEmail: '',
        userPhone: '',
        userGender: 'male',
        roleIds: [],
        status: '1',
        remark: ''
      })
    }

    showPassword.value = false
  }

  /**
   * 监听对话框状态变化
   */
  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        await loadRoleList()
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      submitting.value = true

      const submitData: any = {
        userName: formData.userName.trim(),
        nickName: formData.nickName.trim(),
        userEmail: formData.userEmail.trim(), // 空字符串也传，表示清空
        userPhone: formData.userPhone.trim(), // 空字符串也传，表示清空
        userGender: formData.userGender,
        roleIds: formData.roleIds,
        status: formData.status
      }

      if (dialogType.value === 'add') {
        // 新增用户：密码必填
        submitData.password = formData.password
        // 新增时，空字符串转为 undefined（不提交）
        if (!submitData.userEmail) {
          delete submitData.userEmail
        }
        if (!submitData.userPhone) {
          delete submitData.userPhone
        }
        await fetchCreateUser(submitData)
      } else {
        // 编辑用户：密码不为空才提交（允许修改密码）
        const userId = props.userData?.id
        if (!userId) {
          ElMessage.error('用户ID不存在')
          return
        }

        // 如果密码不为空，则包含密码字段
        if (formData.password && formData.password.trim()) {
          submitData.password = formData.password
        }

        await fetchUpdateUser(userId, submitData)
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
  .cursor-pointer {
    cursor: pointer;
  }
</style>
