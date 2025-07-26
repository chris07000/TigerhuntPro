import axios from 'axios'
import { Signal, CreateSignalRequest, PaginatedSignalResponse, SignalFilters } from '@/types/signal'

// Dynamic API URL for production deployment
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current domain in production
    if (process.env.NODE_ENV === 'production') {
      return `${window.location.origin}/api`
    }
  }
  // Server-side or development
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : `${API_BASE_URL}/api`,
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
  // Alle signalen ophalen met paginatie en filtering
  getSignals: async (filters: SignalFilters & { page?: number; limit?: number } = {}) => {
    const response = await api.get<PaginatedSignalResponse>('/signals', { params: filters })
    return response.data
  },

  // Specifiek signaal ophalen
  getSignalById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Signal }>(`/signals/${id}`)
    return response.data
  },

  // Handmatig signaal aanmaken
  createSignal: async (signalData: CreateSignalRequest) => {
    const response = await api.post<{ success: boolean; data: Signal }>('/signals', signalData)
    return response.data
  },

  // Signaal updaten
  updateSignal: async (id: string, updateData: Partial<CreateSignalRequest>) => {
    const response = await api.put<{ success: boolean; data: Signal }>(`/signals/${id}`, updateData)
    return response.data
  },

  // Signaal verwijderen
  deleteSignal: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/signals/${id}`)
    return response.data
  },

  // Test webhook endpoint
  testWebhook: async (testData = {}) => {
    const response = await api.post('/webhook/test', testData)
    return response.data
  }
}

export const healthApi = {
  // Health check
  checkHealth: async () => {
    const response = await api.get('/health')
    return response.data
  }
}

export default api 