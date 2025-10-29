import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/axiosInstance';
import { authToken } from '@/shared/lib/authToken';
import { LoginForm } from '@/widgets/LoginForm/ui/LoginForm';
import { parseApiError } from '@/shared/lib/errors/parseApiError';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      console.log('=== LOGIN DEBUG ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // 서버 응답에서 토큰 추출 (여러 가능성 처리)
      const token = 
        response.data?.token ||           // { token: "..." }
        response.data?.accessToken ||     // { accessToken: "..." }
        response.data?.access_token ||    // { access_token: "..." }
        response.data?.data?.token ||     // { data: { token: "..." } }
        response.data?.data?.accessToken; // { data: { accessToken: "..." } }
      
      console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
      
      if (token) {
        authToken.set(token);
        console.log('Token saved to localStorage');
        console.log('===================');
        
        // Dashboard로 이동
        navigate('/dashboard');
      } else {
        console.error('Token not found in response!');
        console.log('Available fields:', Object.keys(response.data || {}));
        console.log('===================');
        throw new Error('서버 응답에 토큰이 없습니다. 응답 구조를 확인해주세요.');
      }
    } catch (err: unknown) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', err);
      console.error('===================');
      
      const apiError = parseApiError(err, 'auth');
      throw new Error(apiError.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};