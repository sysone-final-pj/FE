import { useState } from 'react';
import { Lock, UserRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onLogin?: (username: string, password: string) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (onLogin) {
        await onLogin(username, password);
      } else {
        // TODO: 실제 로그인 API 호출 구현
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/dashboard');
      }
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleQuestion = () => {
    // TODO: 고객센터 페이지로 이동
    navigate('/help');
  };

  return (
    <div className="w-full max-w-md shadow-xl border-0 bg-white rounded-xl">
      <div className="space-y-1 pb-8 pt-8 px-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0492F4]">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center text-gray-900">로그인</h2>
        <p className="text-sm text-center text-gray-500">
          계정에 로그인하여 계속하세요
        </p>
      </div>

      <div className="pb-8 px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="flex items-center gap-2 text-sm leading-none font-medium select-none"
            >
              아이디
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                placeholder="your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-1 pl-10 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0492F4] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="flex items-center gap-2 text-sm leading-none font-medium select-none"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-1 pl-10 pr-10 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0492F4] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-[#0492F4] hover:bg-[#0379d1] text-white font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <button
              type="button"
              onClick={handleQuestion}
              className="text-[#0492F4] hover:text-[#0379d1] transition-colors font-medium"
            >
              로그인 중 문제가 발생했나요?
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};