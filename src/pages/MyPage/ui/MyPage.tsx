import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button/Button';
import { ModalSection } from '@/shared/ui/ModalSection/ModalSection';
import { EditUserModal } from '@/widgets/EditUserModal';
import type { User } from '@/entities/user/model/types';
import { getCurrentUser } from '@/shared/lib/jwtUtils';
import { userApi } from '@/shared/api/user';
import { parseApiError } from '@/shared/lib/errors/parseApiError';

// API 응답을 UI 타입으로 매핑
// 백엔드는 이미 프론트엔드 형식(companyName, mobileNumber, officePhone)으로 응답
const mapUser = (apiUser: any): User => ({
  id: apiUser.id,
  username: apiUser.username,
  name: apiUser.name,
  companyName: apiUser.companyName || apiUser.company || '',
  position: apiUser.position || '',
  mobileNumber: apiUser.mobileNumber || apiUser.mobile || '',
  officePhone: apiUser.officePhone || apiUser.office || '',
  email: apiUser.email,
  note: apiUser.note || '',
});

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-px">
    <label className="text-sm font-medium text-text-secondary px-2 font-pretendard tracking-tight">
      {label}
    </label>
    <div className="bg-gray-100 rounded-lg h-[35px] px-4 flex items-center text-sm text-gray-700 font-pretendard tracking-tight">
      {value || '-'}
    </div>
  </div>
);

export const MyPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = getCurrentUser();
      console.log('🔍 MyPage - Current User from JWT:', currentUser);

      if (!currentUser?.userId) {
        console.error('❌ MyPage - No userId found in JWT');
        setError('로그인 정보를 찾을 수 없습니다.');
        return;
      }

      console.log('📡 MyPage - Fetching user data for userId:', currentUser.userId);
      const userData = await userApi.getUser(Number(currentUser.userId));
      console.log('✅ MyPage - API Response:', userData);

      const mappedUser = mapUser(userData);
      console.log('🔄 MyPage - Mapped User:', mappedUser);
      setUser(mappedUser);
    } catch (err) {
      console.error('❌ MyPage - Error fetching user data:', err);
      const apiError = parseApiError(err, 'user');
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchUserData(); // 수정 후 데이터 새로고침
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary font-pretendard">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 font-pretendard">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary font-pretendard">사용자 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 font-pretendard">
            My Page
          </h1>
          <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>
            Edit Profile
          </Button>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-border-light">
          {/* Account Section */}
          <ModalSection title="Account">
            <div className="flex flex-col gap-2">
              <InfoField label="Username" value={user.username} />
            </div>
          </ModalSection>

          {/* Business Information Section */}
          <ModalSection title="Business Information">
            <div className="flex flex-col gap-2">
              <InfoField label="Name" value={user.name} />
              <InfoField label="Company Name" value={user.companyName} />
              <InfoField label="Position" value={user.position} />
              <InfoField label="Mobile Number" value={user.mobileNumber} />
              <InfoField label="Office Phone" value={user.officePhone} />
              <InfoField label="Email" value={user.email} />
            </div>
          </ModalSection>

          {/* Note Section */}
          <div className="px-8 py-4 border-b border-border-light">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 font-pretendard tracking-tight">
                Note
              </label>
              <div className="bg-gray-100 rounded-lg min-h-[100px] p-3 text-sm text-gray-700 font-pretendard tracking-tight whitespace-pre-wrap">
                {user.note || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && user && (
        <EditUserModal
          onClose={() => setIsEditModalOpen(false)}
          onEditUser={handleEditSuccess}
          user={user}
          currentUserRole="USER"
        />
      )}
    </div>
  );
};
