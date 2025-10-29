import { Navigate, Outlet } from 'react-router-dom';
import { authToken } from '@/shared/lib/authToken';

export const ProtectedRoute = () => {
  const isAuthenticated = authToken.exists();

  if (!isAuthenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    // replace를 사용하여 뒤로가기 히스토리에 남지 않도록 함
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
};