import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/axiosInstance';
import { LoginForm } from '@/widgets/LoginForm/ui/LoginForm';
import { parseApiError } from '@/shared/lib/errors/parseApiError';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
      }
      navigate('/dashboard');
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
