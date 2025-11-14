import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
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
import { DashboardPage } from '@/pages/DashboardPage/ui/DashboardPage';
import HistoryPage from '@/pages/HistoryPage';

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
    // 🔴 변경: h-screen → min-h-screen, overflow-hidden 제거
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {shouldShowHeader && currentUser && (
        <Header
          userName={currentUser.username}
          userRole={currentUser.role}
          initialAlerts={alertsData}
          currentPath={location.pathname}
          onLogout={handleLogout}
        />
      )}

      {/* 메인 컨텐츠 영역 - 화면에 따라 늘어나는 영역 */}
      <main className="flex-1">
        <Routes>
          {/* 로그인 페이지 (Public) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<ManageUsersPage />} />
            <Route path="/containers" element={<ContainersPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/agents" element={<ManageAgentsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          {/* 404 → 로그인 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Footer - 문서 맨 아래 */}
      {shouldShowHeader && currentUser && <Footer />}
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