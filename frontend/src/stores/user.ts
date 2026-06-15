import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api'
import router from '../router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')

  async function login(user: string, password: string) {
    const res = await authApi.login(user, password) as any
    const data = res.data || res
    token.value = data.access_token
    username.value = data.user?.username || user
    localStorage.setItem('token', token.value)
    localStorage.setItem('username', username.value)
  }

  async function register(user: string, password: string) {
    const res = await authApi.register(user, password) as any
    const data = res.data || res
    token.value = data.access_token
    username.value = data.user?.username || user
    localStorage.setItem('token', token.value)
    localStorage.setItem('username', username.value)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }

  return { token, username, login, register, logout }
})
