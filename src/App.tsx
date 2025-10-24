import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from '@/widgets/Header/Header';
import { alertsData } from '@/shared/mocks/alertsData';

// 페이지 import
import ContainersPage from '@/pages/containers/ContainersPage';
import { ManageUsersPage } from '@/pages/ManageUsersPage/ui/ManageUsersPage';
import { AlertsPage } from '@/pages/AlertsPage/ui/AlertsPage';
import { ManageAgentsPage } from '@/pages/ManageAgentsPage/ui/ManageAgentsPage';

// test 페이지 import
import { TestConnection } from '@/pages/TestConnection/TestConnection';

export const App = () => {
  const location = useLocation();

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header는 상단 고정 */}
      <Header
        userName="admin"
        userRole="관리자"
        initialAlerts={alertsData}
        currentPath={location.pathname}
        onLogout={handleLogout}
      />

      {/* 라우팅 영역 */}
      <Routes>
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

export default App;