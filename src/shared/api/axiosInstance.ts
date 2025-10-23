import axios from 'axios'
import { parseApiError } from './errorHandler'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 환경별 timeout 설정 (dev = 무제한, prod = 10초)
const TIMEOUT = import.meta.env ? 0 : 10000

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true,
})

// 요청 인터셉터 (JWT 자동 주입)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const parsed = parseApiError(error)

    // 콘솔 로깅 or Toast 메시지 표시
    console.warn(`[API ERROR] ${parsed.type}: ${parsed.message}`)

    // 토큰 만료 시 자동 로그아웃
    if (parsed.status === 401) {
      localStorage.removeItem('accessToken')
      // window.location.href = '/login'
    }

    return Promise.reject(parsed)
  }
)
