import request from './request'

export const getTimelineEvents = (params) => request.get('/timeline', { params })

export const createTimelineEvent = (data) => request.post('/timeline', data)

export const getTimelineEvent = (id) => request.get(`/timeline/${id}`)

export const updateTimelineEvent = (id, data) => request.put(`/timeline/${id}`, data)

export const deleteTimelineEvent = (id) => request.delete(`/timeline/${id}`)
