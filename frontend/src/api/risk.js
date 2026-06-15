import request from './request'

export const getStatus = () => request.get('/risk/status')

export const getAlerts = () => request.get('/risk/alerts')
