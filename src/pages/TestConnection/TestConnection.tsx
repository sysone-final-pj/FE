import React, { useState } from 'react'
import { testConnection } from '@/shared/api/testConnection'

export const TestConnection = () => {
  const [result, setResult] = useState<string>('')

  const handleTest = async () => {
    const res = await testConnection()
    if ('status' in res) {
      setResult(`서버 응답: ${JSON.stringify(res)}`)
    } else {
      setResult(`에러: ${res.message}`)
    }
  }

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-xl font-semibold">🔌 백엔드 연결 테스트</h1>
      <button
        onClick={handleTest}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        통신 테스트
      </button>
      <pre className="mt-4 bg-gray-100 p-4 rounded w-full text-sm overflow-x-auto">
        {result || '결과 없음'}
      </pre>
    </div>
  )
}
