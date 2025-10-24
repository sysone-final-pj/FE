import { LoginForm } from '@/widgets/LoginForm/ui/LoginForm';
import { api } from '@/shared/api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    // 실제 로그인 API 호출
    // Axios Interceptor가 자동으로 스피너를 표시/숨김 처리합니다
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // 토큰 저장
    if (response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
    }
    
    // 대시보드로 이동
    navigate('/users');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};