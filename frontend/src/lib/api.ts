import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''
const isLocalhost = apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')

const api = axios.create({
  baseURL: isLocalhost ? '/api' : apiUrl,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
