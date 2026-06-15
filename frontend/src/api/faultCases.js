import request from './request'

export const getFaultCases = (params) => request.get('/fault-cases', { params })

export const createFaultCase = (data) => request.post('/fault-cases', data)

export const getFaultCase = (id) => request.get(`/fault-cases/${id}`)

export const updateFaultCase = (id, data) => request.put(`/fault-cases/${id}`, data)

export const deleteFaultCase = (id) => request.delete(`/fault-cases/${id}`)
