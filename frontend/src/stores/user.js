import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth'
import { ElMessage } from 'element-plus'
import router from '../router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  const isLoggedIn = computed(() => !!token.value)

  const login = async (loginUsername, password) => {
    const res = await apiLogin(loginUsername, password)
    const data = res.data || res
    token.value = data.access_token || data.token || ''
    username.value = data.user?.username || loginUsername
    localStorage.setItem('token', token.value)
    localStorage.setItem('username', username.value)
    ElMessage.success('登录成功')
    router.push('/')
  }

  const register = async (regUsername, password) => {
    const res = await apiRegister(regUsername, password)
    const data = res.data || res
    token.value = data.access_token || data.token || ''
    username.value = data.user?.username || regUsername
    localStorage.setItem('token', token.value)
    localStorage.setItem('username', username.value)
    ElMessage.success('注册成功')
    router.push('/')
  }

  const logout = () => {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  const checkAuth = async () => {
    if (!token.value) return false
    try {
      await getMe()
      return true
    } catch {
      logout()
      return false
    }
  }

  return { token, username, isLoggedIn, login, register, logout, checkAuth }
})
