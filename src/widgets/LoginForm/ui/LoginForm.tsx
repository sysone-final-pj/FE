import { useState } from 'react';
import { Lock, UserRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
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
      await onLogin(username, password);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? '서버 오류가 발생했습니다.');
      } 
      else if (err instanceof Error) {
        setError(err.message);
      } 
      else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handleHelp = () => {
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
        <p className="text-sm text-center text-text-secondary">계정에 로그인하여 계속하세요</p>
      </div>

      <div className="pb-8 px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* 아이디 입력 */}
          <div className="space-y-2">
            <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium select-none">
              아이디
            </label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-1 pl-10 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0492F4]"
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium select-none">
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-1 pl-10 pr-10 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0492F4]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-text-secondary"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full h-14 bg-[#0492F4] hover:bg-[#0379d1] text-white font-medium rounded-md transition-all duration-200"
          >
            로그인
          </button>
        </form>

        {/* 문의 버튼 */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleHelp}
            className="text-sm text-[#0492F4] hover:text-[#0379d1] font-medium transition-colors"
          >
            로그인 중 문제가 발생했나요?
          </button>
        </div>
      </div>
    </div>
  );
};
