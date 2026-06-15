import request from './request'

export const getLabs = (params) => request.get('/labs', { params })

export const createLab = (data) => request.post('/labs', data)

export const getLab = (id) => request.get(`/labs/${id}`)

export const updateLab = (id, data) => request.put(`/labs/${id}`, data)

export const deleteLab = (id) => request.delete(`/labs/${id}`)
