import { ofetch } from 'ofetch'
import router from '../router'

const api = ofetch.create({
  baseURL: '/api/v1',
  onRequest({ options }) {
    const token = localStorage.getItem('token')
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      router.push('/login')
    }
  },
})

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api('/auth/login', { method: 'POST', body: { username, password } }),
  register: (username: string, password: string) =>
    api('/auth/register', { method: 'POST', body: { username, password } }),
  getMe: () => api('/auth/me'),
}

// Work Cases
export const workCasesApi = {
  list: (params?: Record<string, any>) => api('/work-cases', { params }),
  create: (data: Record<string, any>) =>
    api('/work-cases', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/work-cases/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/work-cases/${id}`, { method: 'DELETE' }),
}

// Fault Cases
export const faultCasesApi = {
  list: (params?: Record<string, any>) => api('/fault-cases', { params }),
  create: (data: Record<string, any>) =>
    api('/fault-cases', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/fault-cases/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/fault-cases/${id}`, { method: 'DELETE' }),
}

// Labs
export const labsApi = {
  list: (params?: Record<string, any>) => api('/labs', { params }),
  create: (data: Record<string, any>) =>
    api('/labs', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/labs/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/labs/${id}`, { method: 'DELETE' }),
}

// Knowledge
export const knowledgeApi = {
  list: (params?: Record<string, any>) => api('/knowledge-cards', { params }),
  create: (data: Record<string, any>) =>
    api('/knowledge-cards', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/knowledge-cards/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/knowledge-cards/${id}`, { method: 'DELETE' }),
}

// Projects
export const projectsApi = {
  list: (params?: Record<string, any>) => api('/projects', { params }),
  create: (data: Record<string, any>) =>
    api('/projects', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/projects/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/projects/${id}`, { method: 'DELETE' }),
}

// Daily Logs
export const dailyLogsApi = {
  list: (params?: Record<string, any>) => api('/daily-logs', { params }),
  create: (data: Record<string, any>) =>
    api('/daily-logs', { method: 'POST', body: data }),
  remove: (id: number | string) =>
    api(`/daily-logs/${id}`, { method: 'DELETE' }),
}

// Time Records
export const timeRecordsApi = {
  list: (params?: Record<string, any>) => api('/time-records', { params }),
  create: (data: Record<string, any>) =>
    api('/time-records', { method: 'POST', body: data }),
  remove: (id: number | string) =>
    api(`/time-records/${id}`, { method: 'DELETE' }),
}

// Timeline
export const timelineApi = {
  list: (params?: Record<string, any>) => api('/timeline', { params }),
  create: (data: Record<string, any>) =>
    api('/timeline', { method: 'POST', body: data }),
  update: (id: number | string, data: Record<string, any>) =>
    api(`/timeline/${id}`, { method: 'PUT', body: data }),
  remove: (id: number | string) =>
    api(`/timeline/${id}`, { method: 'DELETE' }),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api('/dashboard/stats'),
  getToday: () => api('/dashboard/today'),
  getStreak: () => api('/dashboard/streak'),
  getStagnation: () => api('/dashboard/stagnation'),
  getMonthlyTrend: () => api('/dashboard/monthly-trend'),
  getCategoryRatio: () => api('/dashboard/category-ratio'),
}

// Risk
export const riskApi = {
  status: () => api('/risk/status'),
  alerts: () => api('/risk/alerts'),
}
