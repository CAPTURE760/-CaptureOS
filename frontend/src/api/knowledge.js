import request from './request'

export const getKnowledge = (params) => request.get('/knowledge', { params })

export const createKnowledge = (data) => request.post('/knowledge', data)

export const getKnowledgeItem = (id) => request.get(`/knowledge/${id}`)

export const updateKnowledge = (id, data) => request.put(`/knowledge/${id}`, data)

export const deleteKnowledge = (id) => request.delete(`/knowledge/${id}`)
