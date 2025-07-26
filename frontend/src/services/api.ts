import axios from 'axios'
import { Signal, CreateSignalRequest, PaginatedSignalResponse, SignalFilters } from '@/types/signal'

// Force production backend URL
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://tigerhunt-pro-backend-k742.vercel.app'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://tigerhunt-pro-backend-k742.vercel.app/api' : `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor voor logging (development only)
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

// Response interceptor voor error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data)
    }
    return Promise.reject(error)
  }
)

export const signalApi = {
  getAllSignals: async (filters?: SignalFilters): Promise<PaginatedSignalResponse> => {
    try {
      const response = await api.get('/signals', { params: filters })
      return response.data
    } catch (error) {
      // Fallback to empty data if backend not available
              return {
          success: false,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 10
          }
        }
    }
  },

  createSignal: async (signal: CreateSignalRequest): Promise<Signal> => {
    try {
      const response = await api.post('/signals', signal)
      return response.data
    } catch (error) {
      console.error('Failed to create signal:', error)
      throw error
    }
  },

  deleteSignal: async (id: string): Promise<void> => {
    try {
      await api.delete(`/signals/${id}`)
    } catch (error) {
      console.error('Failed to delete signal:', error)
      throw error
    }
  }
}

export default api 