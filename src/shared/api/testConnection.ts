import { api } from './axiosInstance'
import { parseApiError } from './errorHandler'

export async function testConnection() {
  try {
    const res = await api.get('/api/members')
    console.log('서버 연결 성공:', res.data)
    return res.data
  } catch (error) {
    const err = parseApiError(error)
    console.error('서버 연결 실패:', err.message)
    return err
  }
}
