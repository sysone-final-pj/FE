import { Modal } from '@/shared/ui/Modal/Modal';
import { ModalHeader } from '@/shared/ui/ModalHeader/ModalHeader';
import { Button } from '@/shared/ui/Button/Button';
import { ModalSection } from '@/shared/ui/ModalSection/ModalSection';
import type { User } from '@/entities/user/model/types';

interface InfoUserModalProps {
  onClose: () => void;
  user: User;
}

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

export const InfoUserModal = ({ onClose, user }: InfoUserModalProps) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <ModalHeader title="User Information" onClose={onClose} />

        <div className="flex-1 overflow-y-auto">
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

        {/* Close Button */}
        <div className="flex items-center justify-end gap-3 px-8 py-5">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
