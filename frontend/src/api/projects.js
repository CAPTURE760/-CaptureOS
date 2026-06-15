import request from './request'

export const getProjects = (params) => request.get('/projects', { params })

export const createProject = (data) => request.post('/projects', data)

export const getProject = (id) => request.get(`/projects/${id}`)

export const updateProject = (id, data) => request.put(`/projects/${id}`, data)

export const deleteProject = (id) => request.delete(`/projects/${id}`)
