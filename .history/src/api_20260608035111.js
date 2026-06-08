import axios from 'axios'

const api = axios.create({
  baseURL: 'https://taskmanager-api-issam-avafg0fphpe8bqbb.germanywestcentral-01.azurewebsites.net/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tasks
export const getTasks = () => api.get('/tasks')
export const createTask = (task) => api.post('/tasks', task)
export const updateTask = (id, task) => api.put(`/tasks/${id}`, task)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (username, email, password, role = 'Employee', organizationName = null, organizationId = null) =>
  api.post('/auth/register', { username, email, password, role, organizationName, organizationId })

// Admin
export const getUsers = () => api.get('/admin/users')
export const getUserTasks = (id) => api.get(`/admin/users/${id}/tasks`)
export const createTaskForUser = (task) => api.post('/admin/tasks', task)
export const getOrganization = () => api.get('/admin/organization')
export const deleteUser = (id) => api.delete(`/admin/users/${id}`)

// Events
export const getEvents = () => api.get('/events')
export const createEvent = (event) => api.post('/events', event)
export const respondToEvent = (id, status) => api.post(`/events/${id}/respond`, { status })
export const approveResponse = (eventId, userId) => api.post(`/events/${eventId}/approve/${userId}`)
export const removeResponse = (eventId, userId) => api.delete(`/events/${eventId}/remove/${userId}`)
export const deleteEvent = (id) => api.delete(`/events/${id}`)
export const getMyEventStats = () => api.get('/events/my-stats')

// Notifications
export const getVapidKey = () => api.get('/notifications/vapid-public-key')
export const subscribeNotifications = (data) => api.post('/notifications/subscribe', data)
export const unsubscribeNotifications = (endpoint) => api.delete('/notifications/unsubscribe', { data: { endpoint } })

export default api