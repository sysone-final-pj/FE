import { Navigate, Outlet } from 'react-router-dom';
import { authToken } from '@/shared/lib/authToken';
import { getCurrentUser } from '@/shared/lib/jwtUtils';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // 허용된 역할 목록 (선택적)
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = authToken.exists();

  if (!isAuthenticated) {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    // replace를 사용하여 뒤로가기 히스토리에 남지 않도록 함
    return <Navigate to="/login" replace />;
  }

  // 역할 기반 접근 제어
  if (allowedRoles && allowedRoles.length > 0) {
    const currentUser = getCurrentUser();

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
      // 권한이 없는 경우 대시보드로 리다이렉트
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
};