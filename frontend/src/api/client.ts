import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// En dev → proxy Vite vers localhost:8000
// En prod → backend Render
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD
    ? 'https://devoir-ai-backend.onrender.com/api'
    : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
})

// Token automatique
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 → déconnexion
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
