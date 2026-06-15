import request from './request'

export const getStats = () => request.get('/dashboard/stats')

export const getToday = () => request.get('/dashboard/today')

export const getStreak = () => request.get('/dashboard/streak')

export const getStagnation = () => request.get('/dashboard/stagnation')

export const getMonthlyTrend = () => request.get('/dashboard/monthly-trend')

export const getCategoryRatio = () => request.get('/dashboard/category-ratio')
