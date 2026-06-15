import request from './request'

export const getWorkCases = (params) => request.get('/work-cases', { params })

export const createWorkCase = (data) => request.post('/work-cases', data)

export const getWorkCase = (id) => request.get(`/work-cases/${id}`)

export const updateWorkCase = (id, data) => request.put(`/work-cases/${id}`, data)

export const deleteWorkCase = (id) => request.delete(`/work-cases/${id}`)
