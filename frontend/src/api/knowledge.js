import request from './request'

export const getKnowledge = (params) => request.get('/knowledge-cards', { params })

export const createKnowledge = (data) => request.post('/knowledge-cards', data)

export const getKnowledgeItem = (id) => request.get(`/knowledge-cards/${id}`)

export const updateKnowledge = (id, data) => request.put(`/knowledge-cards/${id}`, data)

export const deleteKnowledge = (id) => request.delete(`/knowledge-cards/${id}`)
