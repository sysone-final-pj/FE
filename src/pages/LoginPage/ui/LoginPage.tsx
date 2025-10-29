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

      // 서버 응답에서 토큰 추출
      const token = 
        response.data?.accessToken;

      if (token) {
        authToken.set(token);

        // Dashboard로 이동
        navigate('/dashboard');
      } else {

        throw new Error('서버 응답에 토큰이 없습니다. 응답 구조를 확인해주세요.');
      }
    } catch (err: unknown) {
      
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