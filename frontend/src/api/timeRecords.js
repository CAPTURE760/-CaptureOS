import request from './request'

export const getTimeRecords = (params) => request.get('/time-records', { params })

export const createTimeRecord = (data) => request.post('/time-records', data)

export const getTimeRecord = (id) => request.get(`/time-records/${id}`)

export const updateTimeRecord = (id, data) => request.put(`/time-records/${id}`, data)

export const deleteTimeRecord = (id) => request.delete(`/time-records/${id}`)
