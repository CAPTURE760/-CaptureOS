<template>
  <div class="login-container">
    <n-card class="login-card">
      <div class="logo-area">
        <div class="logo-icon">C</div>
        <h1 class="logo-title">CaptureOS</h1>
        <p class="logo-subtitle">个人职业资产管理系统</p>
      </div>

      <n-tabs v-model:value="activeTab" animated>
        <n-tab-pane name="login" tab="登录">
          <n-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="loginForm.username"
                placeholder="请输入用户名"
                @keyup.enter="handleLogin"
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="loginForm.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                @keyup.enter="handleLogin"
              />
            </n-form-item>
            <n-button
              type="primary"
              block
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </n-button>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="register" tab="注册">
          <n-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="registerForm.username"
                placeholder="请输入用户名"
                @keyup.enter="handleRegister"
              />
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="registerForm.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                @keyup.enter="handleRegister"
              />
            </n-form-item>
            <n-button
              type="primary"
              block
              :loading="loading"
              @click="handleRegister"
            >
              注册
            </n-button>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NTabs, NTabPane, NForm, NFormItem,
  NInput, NButton, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useUserStore } from '../stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)

const loginFormRef = ref<FormInst | null>(null)
const registerFormRef = ref<FormInst | null>(null)

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '' })

const loginRules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

const registerRules: FormRules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' },
}

async function handleLogin() {
  try {
    await loginFormRef.value?.validate()
    loading.value = true
    await userStore.login(loginForm.value.username, loginForm.value.password)
    message.success('登录成功')
    router.push('/')
  } catch (err: any) {
    if (err?.message) {
      message.error(err.message || '登录失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  try {
    await registerFormRef.value?.validate()
    loading.value = true
    await userStore.register(registerForm.value.username, registerForm.value.password)
    message.success('注册成功')
    router.push('/')
  } catch (err: any) {
    if (err?.message) {
      message.error(err.message || '注册失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.login-card {
  width: 420px;
  border-radius: 12px;
}

.logo-area {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #e94560, #c0392b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 auto 12px;
}

.logo-title {
  font-size: 28px;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.logo-subtitle {
  font-size: 14px;
  color: #8b949e;
}
</style>
