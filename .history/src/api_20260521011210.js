import axios from 'axios'

const api = axios.create({
  baseURL: 'https://taskmanager-api-issam-avafg0fphpe8bqbb.germanywestcentral-01.azurewebsites.net/api',
})

// نضيف Token تلقائياً لكل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tasks
export const getTasks   = ()           => api.get('/tasks')
export const createTask = (task)       => api.post('/tasks', task)
export const updateTask = (id, task)   => api.put(`/tasks/${id}`, task)
export const deleteTask = (id)         => api.delete(`/tasks/${id}`)

// Auth
export const login    = (email, password)              => api.post('/auth/login', { email, password })
export const register = (username, email, password, role = 'Employee') =>
  api.post('/auth/register', { username, email, password, role })