import request from './request'

export const getDailyLogs = (params) => request.get('/daily-logs', { params })

export const createDailyLog = (data) => request.post('/daily-logs', data)

export const getDailyLog = (id) => request.get(`/daily-logs/${id}`)

export const updateDailyLog = (id, data) => request.put(`/daily-logs/${id}`, data)

export const deleteDailyLog = (id) => request.delete(`/daily-logs/${id}`)
