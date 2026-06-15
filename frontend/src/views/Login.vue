<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)">
    <div style="width: 420px; background: #161b22; border: 1px solid rgba(233,69,96,0.2); border-radius: 16px; padding: 40px">
      <div style="text-align: center; margin-bottom: 24px">
        <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #e94560, #c0392b); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #fff; margin: 0 auto 12px">C</div>
        <h1 style="font-size: 28px; font-weight: 700; color: #e0e0e0; margin-bottom: 4px">CaptureOS</h1>
        <p style="font-size: 14px; color: #8b949e">个人职业资产管理系统</p>
      </div>

      <div style="display: flex; gap: 16px; margin-bottom: 24px">
        <div @click="mode = 'login'" :style="{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderBottom: mode === 'login' ? '2px solid #e94560' : '2px solid transparent', color: mode === 'login' ? '#e94560' : '#a0aec0' }">登录</div>
        <div @click="mode = 'register'" :style="{ flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', borderBottom: mode === 'register' ? '2px solid #e94560' : '2px solid transparent', color: mode === 'register' ? '#e94560' : '#a0aec0' }">注册</div>
      </div>

      <div v-if="mode === 'login'">
        <input v-model="loginForm.username" placeholder="用户名" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e0e0e0; margin-bottom: 16px; font-size: 14px" />
        <input v-model="loginForm.password" type="password" placeholder="密码" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e0e0e0; margin-bottom: 24px; font-size: 14px" @keyup.enter="handleLogin" />
        <button @click="handleLogin" :disabled="loading" style="width: 100%; padding: 12px; background: #e94560; border: none; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer">{{ loading ? '登录中...' : '登录' }}</button>
      </div>

      <div v-else>
        <input v-model="regForm.username" placeholder="用户名" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e0e0e0; margin-bottom: 16px; font-size: 14px" />
        <input v-model="regForm.password" type="password" placeholder="密码" style="width: 100%; padding: 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #e0e0e0; margin-bottom: 24px; font-size: 14px" @keyup.enter="handleRegister" />
        <button @click="handleRegister" :disabled="loading" style="width: 100%; padding: 12px; background: #e94560; border: none; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer">{{ loading ? '注册中...' : '注册' }}</button>
      </div>

      <p v-if="error" style="color: #e94560; text-align: center; margin-top: 16px; font-size: 14px">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const mode = ref('login')
const loading = ref(false)
const error = ref('')
const loginForm = ref({ username: '', password: '' })
const regForm = ref({ username: '', password: '' })

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.login(loginForm.value.username, loginForm.value.password)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  if (!regForm.value.username || !regForm.value.password) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await userStore.register(regForm.value.username, regForm.value.password)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.message || e?.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
