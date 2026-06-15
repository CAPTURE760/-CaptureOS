import request from './request'

export const login = (username, password) =>
  request.post('/auth/login', { username, password })

export const register = (username, password) =>
  request.post('/auth/register', { username, password })

export const getMe = () => request.get('/auth/me')
