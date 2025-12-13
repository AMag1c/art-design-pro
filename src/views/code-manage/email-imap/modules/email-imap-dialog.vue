<!-- 邮箱IMAP弹窗组件 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      :model="formModel"
      :columns="formColumns"
      :rules="formRules"
      :label-width="120"
      :col-span="24"
    />

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitLoading" v-ripple>
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ArtFormColumn } from '@/types'
  import { DialogType } from '@/types'

  defineOptions({ name: 'EmailImapDialog' })

  interface EmailData {
    id?: string
    email?: string
    imapServer?: string
    imapPort?: number
    username?: string
    password?: string
    useSsl?: boolean
    status?: string
  }

  const props = defineProps<{
    type: DialogType
    emailData?: Partial<EmailData>
  }>()

  const emit = defineEmits<{
    submit: [formData: EmailData]
  }>()

  const dialogVisible = defineModel<boolean>('visible', { required: true })

  const formRef = ref()
  const submitLoading = ref(false)

  const formModel = ref<EmailData>({
    email: '',
    imapServer: '',
    imapPort: 993,
    username: '',
    password: '',
    useSsl: true,
    status: 'inactive'
  })

  const dialogTitle = computed(() => {
    return props.type === 'add' ? '新增邮箱' : '编辑邮箱'
  })

  const formColumns: ArtFormColumn[] = [
    {
      prop: 'email',
      label: '邮箱地址',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入邮箱地址',
        clearable: true
      }
    },
    {
      prop: 'imapServer',
      label: 'IMAP服务器',
      component: 'ElInput',
      componentProps: {
        placeholder: '例如: imap.gmail.com',
        clearable: true
      }
    },
    {
      prop: 'imapPort',
      label: 'IMAP端口',
      component: 'ElInputNumber',
      componentProps: {
        placeholder: '请输入端口',
        min: 1,
        max: 65535,
        controls: true
      }
    },
    {
      prop: 'username',
      label: '用户名',
      component: 'ElInput',
      componentProps: {
        placeholder: '请输入用户名',
        clearable: true
      }
    },
    {
      prop: 'password',
      label: '密码',
      component: 'ElInput',
      componentProps: {
        type: 'password',
        placeholder: '请输入密码',
        showPassword: true,
        clearable: true
      }
    },
    {
      prop: 'useSsl',
      label: '使用SSL',
      component: 'ElSwitch',
      componentProps: {
        activeText: '是',
        inactiveText: '否'
      }
    },
    {
      prop: 'status',
      label: '状态',
      component: 'ElSelect',
      componentProps: {
        placeholder: '请选择状态'
      },
      options: [
        { label: '正常', value: 'active' },
        { label: '未激活', value: 'inactive' },
        { label: '连接失败', value: 'error' }
      ]
    }
  ]

  const formRules = {
    email: [
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    imapServer: [{ required: true, message: '请输入IMAP服务器', trigger: 'blur' }],
    imapPort: [{ required: true, message: '请输入IMAP端口', trigger: 'blur' }],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  // 监听邮箱数据变化
  watch(
    () => props.emailData,
    (newVal) => {
      if (newVal && props.type === 'edit') {
        formModel.value = { ...newVal }
      }
    },
    { immediate: true, deep: true }
  )

  // 监听弹窗打开
  watch(dialogVisible, (val) => {
    if (val && props.type === 'add') {
      formModel.value = {
        email: '',
        imapServer: '',
        imapPort: 993,
        username: '',
        password: '',
        useSsl: true,
        status: 'inactive'
      }
    }
  })

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      submitLoading.value = true
      emit('submit', formModel.value)
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      submitLoading.value = false
    }
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
  }
</script>
