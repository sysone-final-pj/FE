import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Header } from '@/widgets/Header/Header';
import { alertsData } from '@/shared/mocks/alertsData';
import { SpinnerProvider } from '@/shared/providers/SpinnerProvider';
import { ProtectedRoute } from '@/ProtectedRoute';
import { authApi } from '@/shared/api/auth';
import { getCurrentUser } from '@/shared/lib/jwtUtils';

// 페이지 import
import ContainersPage from '@/pages/containers/ContainersPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage/ui/ManageUsersPage';
import { AlertsPage } from '@/pages/AlertsPage/ui/AlertsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ManageAgentsPage } from '@/pages/ManageAgentsPage/ui/ManageAgentsPage';

// 헤더가 필요 없는 경로 목록
const PUBLIC_ROUTES = ['/login', '/help'];

const AppContent = () => {
  const location = useLocation ();

  // JWT 토큰에서 사용자 정보 추출 (location 변경 시마다 재계산)
  const currentUser = useMemo(() => getCurrentUser(), [location.pathname]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await authApi.logout();
  };

  // 현재 경로가 public 경로인지 확인
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  // Header 표시 여부
  const shouldShowHeader = !isPublicRoute && currentUser !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public 경로가 아니고 사용자 정보가 있을 때만 Header 표시 */}
      {shouldShowHeader && currentUser && (
        <Header
          userName={currentUser.username}
          userRole={currentUser.role}
          initialAlerts={alertsData}
          currentPath={location.pathname}
          onLogout={handleLogout}
        />
      )}

      {/* 라우팅 영역 */}
      <Routes>
        {/* 로그인 페이지 (Public - 인증 불필요) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes - 인증 필요 */}
        <Route element={<ProtectedRoute />}>
          {/* 기본 URL로 접속 시 dashboard로 리디렉션 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard (TODO: Dashboard 페이지 생성 필요) */}
          <Route path="/dashboard" element={<Navigate to="/containers" replace />} />

          {/* 사용자 관리 페이지 */}
          <Route path="/users" element={<ManageUsersPage />} />

          {/* 컨테이너 관리 페이지 */}
          <Route path="/containers" element={<ContainersPage />} />

          {/* 알림 관리 페이지 */}
          <Route path="/alerts" element={<AlertsPage />} />

          {/* 에이전트 관리 페이지 */}
          <Route path="/agents" element={<ManageAgentsPage />} />

        </Route>

        {/* 404 - 알 수 없는 경로는 로그인 페이지로 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export const App = () => {
  return (
    <SpinnerProvider>
      <AppContent />
    </SpinnerProvider>
  );
};

export default App;