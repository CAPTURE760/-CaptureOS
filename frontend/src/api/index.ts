import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),
  getMe: () => api.get('/auth/me'),
}

// Work Cases
export const workCasesApi = {
  list: (params?: Record<string, any>) => api.get('/work-cases', { params }),
  create: (data: Record<string, any>) => api.post('/work-cases', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/work-cases/${id}`, data),
  remove: (id: number | string) => api.delete(`/work-cases/${id}`),
}

// Fault Cases
export const faultCasesApi = {
  list: (params?: Record<string, any>) => api.get('/fault-cases', { params }),
  create: (data: Record<string, any>) => api.post('/fault-cases', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/fault-cases/${id}`, data),
  remove: (id: number | string) => api.delete(`/fault-cases/${id}`),
}

// Labs
export const labsApi = {
  list: (params?: Record<string, any>) => api.get('/labs', { params }),
  create: (data: Record<string, any>) => api.post('/labs', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/labs/${id}`, data),
  remove: (id: number | string) => api.delete(`/labs/${id}`),
}

// Knowledge
export const knowledgeApi = {
  list: (params?: Record<string, any>) => api.get('/knowledge-cards', { params }),
  create: (data: Record<string, any>) => api.post('/knowledge-cards', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/knowledge-cards/${id}`, data),
  remove: (id: number | string) => api.delete(`/knowledge-cards/${id}`),
}

// Projects
export const projectsApi = {
  list: (params?: Record<string, any>) => api.get('/projects', { params }),
  create: (data: Record<string, any>) => api.post('/projects', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/projects/${id}`, data),
  remove: (id: number | string) => api.delete(`/projects/${id}`),
}

// Daily Logs
export const dailyLogsApi = {
  list: (params?: Record<string, any>) => api.get('/daily-logs', { params }),
  create: (data: Record<string, any>) => api.post('/daily-logs', data),
  remove: (id: number | string) => api.delete(`/daily-logs/${id}`),
}

// Time Records
export const timeRecordsApi = {
  list: (params?: Record<string, any>) => api.get('/time-records', { params }),
  create: (data: Record<string, any>) => api.post('/time-records', data),
  remove: (id: number | string) => api.delete(`/time-records/${id}`),
}

// Timeline
export const timelineApi = {
  list: (params?: Record<string, any>) => api.get('/timeline', { params }),
  create: (data: Record<string, any>) => api.post('/timeline', data),
  update: (id: number | string, data: Record<string, any>) => api.put(`/timeline/${id}`, data),
  remove: (id: number | string) => api.delete(`/timeline/${id}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getToday: () => api.get('/dashboard/today'),
  getStreak: () => api.get('/dashboard/streak'),
  getStagnation: () => api.get('/dashboard/stagnation'),
  getMonthlyTrend: () => api.get('/dashboard/monthly-trend'),
  getCategoryRatio: () => api.get('/dashboard/category-ratio'),
}

// Risk
export const riskApi = {
  status: () => api.get('/risk/status'),
  alerts: () => api.get('/risk/alerts'),
}
