import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/widgets/Header/Header';
import { alertsData } from '@/shared/mocks/alertsData';
import { SpinnerProvider } from '@/shared/providers/SpinnerProvider';
import { setSpinnerHandlers } from '@/shared/api/axiosInstance';
import { useSpinner } from '@/shared/lib/userSpinner';

// 페이지 import
import ContainersPage from '@/pages/containers/ContainersPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage/ui/ManageUsersPage';
import { AlertsPage } from '@/pages/AlertsPage/ui/AlertsPage';
import { LoginPage } from '@/pages/LoginPage';
import { ManageAgentsPage } from '@/pages/ManageAgentsPage/ui/ManageAgentsPage';

// test 페이지 import
import { TestConnection } from '@/pages/TestConnection/TestConnection';

// 헤더가 필요 없는 경로 목록
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

const AppContent = () => {
  const location = useLocation();
  const { showSpinner, hideSpinner } = useSpinner();

  // Axios에 스피너 핸들러 연결
  useEffect(() => {
    setSpinnerHandlers(showSpinner, hideSpinner);
  }, [showSpinner, hideSpinner]);

  const handleLogout = () => {
    // TODO: 실제 로그아웃 API 호출
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  // 현재 경로가 public 경로인지 확인
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public 경로가 아닐 때만 Header 표시 */}
      {!isPublicRoute && (
        <Header
          userName="admin"
          userRole="관리자"
          initialAlerts={alertsData}
          currentPath={location.pathname}
          onLogout={handleLogout}
        />
      )}

      {/* 라우팅 영역 */}
      <Routes>
        {/* 로그인 페이지 (헤더 없음) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 기본 URL로 접속 시 users로 리디렉션 */}
        <Route path="/" element={<Navigate to="/users" replace />} />

        {/* 사용자 관리 페이지 (기본 진입 페이지) */}
        <Route path="/users" element={<ManageUsersPage />} />

        {/* 컨테이너 관리 페이지 */}
        <Route path="/containers" element={<ContainersPage />} />

        {/* 알림 관리 페이지 */}
        <Route path="/alerts" element={<AlertsPage />} />

        {/* 에이전트 관리 페이지 */}
        <Route path="/agents" element={<ManageAgentsPage />} />

        {/* Test 페이지 */}
        <Route path="/test" element={<TestConnection />} />
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