<template>
  <div class="login-page">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <div class="login-header">
          <img src="/favicon.svg" alt="logo" class="login-logo" />
          <h2>CaptureOS</h2>
        </div>
      </template>
      <el-tabs v-model="mode" class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" ref="loginRef" :rules="rules" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" size="large" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" @click="handleLogin" :loading="loading">
                登 录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="regForm" ref="regRef" :rules="rules" @submit.prevent="handleRegister">
            <el-form-item prop="username">
              <el-input v-model="regForm.username" placeholder="用户名" prefix-icon="User" size="large" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="regForm.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" style="width: 100%" @click="handleRegister" :loading="loading">
                注 册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const mode = ref('login')
const loading = ref(false)

const loginForm = ref({ username: '', password: '' })
const regForm = ref({ username: '', password: '' })
const loginRef = ref(null)
const regRef = ref(null)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await loginRef.value.validate()
    loading.value = true
    await userStore.login(loginForm.value.username, loginForm.value.password)
  } catch (e) {
    // validation or API error
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  try {
    await regRef.value.validate()
    loading.value = true
    await userStore.register(regForm.value.username, regForm.value.password)
  } catch (e) {
    // validation or API error
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.login-card {
  width: 420px;
  background-color: #16213e;
  border: 1px solid rgba(233, 69, 96, 0.2);
  border-radius: 16px;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.login-logo {
  width: 40px;
  height: 40px;
}

.login-header h2 {
  color: #e94560;
  font-size: 24px;
  margin: 0;
}

.login-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.08);
}

.login-tabs :deep(.el-tabs__item) {
  color: #a0aec0;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: #e94560;
}
</style>
