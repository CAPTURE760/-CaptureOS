import { ofetch } from 'ofetch'
import router from '../router'

const api = ofetch.create({
  baseURL: '/api/v1',
  headers: {} as Record<string, string>,
})

// 每次请求前自动附加 token
const originalFetch = api
const wrappedApi = ((url: string, opts: any = {}) => {
  const token = localStorage.getItem('token')
  if (token) {
    opts.headers = {
      ...opts.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return originalFetch(url, opts)
}) as typeof api

// 处理 401 错误
export async function request(url: string, opts: any = {}) {
  try {
    return await wrappedApi(url, opts)
  } catch (err: any) {
    if (err?.response?.status === 401 || err?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      router.push('/login')
    }
    throw err
  }
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username: string, password: string) =>
    request('/auth/register', { method: 'POST', body: { username, password } }),
  getMe: () => request('/auth/me'),
}

// Work Cases
export const workCasesApi = {
  list: (params?: Record<string, any>) => request('/work-cases', { params }),
  create: (data: Record<string, any>) => request('/work-cases', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/work-cases/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/work-cases/${id}`, { method: 'DELETE' }),
}

// Fault Cases
export const faultCasesApi = {
  list: (params?: Record<string, any>) => request('/fault-cases', { params }),
  create: (data: Record<string, any>) => request('/fault-cases', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/fault-cases/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/fault-cases/${id}`, { method: 'DELETE' }),
}

// Labs
export const labsApi = {
  list: (params?: Record<string, any>) => request('/labs', { params }),
  create: (data: Record<string, any>) => request('/labs', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/labs/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/labs/${id}`, { method: 'DELETE' }),
}

// Knowledge
export const knowledgeApi = {
  list: (params?: Record<string, any>) => request('/knowledge-cards', { params }),
  create: (data: Record<string, any>) => request('/knowledge-cards', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/knowledge-cards/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/knowledge-cards/${id}`, { method: 'DELETE' }),
}

// Projects
export const projectsApi = {
  list: (params?: Record<string, any>) => request('/projects', { params }),
  create: (data: Record<string, any>) => request('/projects', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/projects/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/projects/${id}`, { method: 'DELETE' }),
}

// Daily Logs
export const dailyLogsApi = {
  list: (params?: Record<string, any>) => request('/daily-logs', { params }),
  create: (data: Record<string, any>) => request('/daily-logs', { method: 'POST', body: data }),
  remove: (id: number | string) => request(`/daily-logs/${id}`, { method: 'DELETE' }),
}

// Time Records
export const timeRecordsApi = {
  list: (params?: Record<string, any>) => request('/time-records', { params }),
  create: (data: Record<string, any>) => request('/time-records', { method: 'POST', body: data }),
  remove: (id: number | string) => request(`/time-records/${id}`, { method: 'DELETE' }),
}

// Timeline
export const timelineApi = {
  list: (params?: Record<string, any>) => request('/timeline', { params }),
  create: (data: Record<string, any>) => request('/timeline', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) => request(`/timeline/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) => request(`/timeline/${id}`, { method: 'DELETE' }),
}

// Dashboard
export const dashboardApi = {
  getStats: () => request('/dashboard/stats'),
  getToday: () => request('/dashboard/today'),
  getStreak: () => request('/dashboard/streak'),
  getStagnation: () => request('/dashboard/stagnation'),
  getMonthlyTrend: () => request('/dashboard/monthly-trend'),
  getCategoryRatio: () => request('/dashboard/category-ratio'),
}

// Risk
export const riskApi = {
  status: () => request('/risk/status'),
  alerts: () => request('/risk/alerts'),
}
