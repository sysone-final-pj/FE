/**
 작성자: 김슬기
 */
import { Input } from '@/shared/ui/Input/Input';
import { Textarea } from '@/shared/ui/Textarea/Textarea';
import { ModalSection } from '@/shared/ui/ModalSection/ModalSection';
import type { User } from '@/entities/user/model/types';

interface EditUserFormData {
  name: string;
  companyName: string;
  position: string;
  mobileNumber: string;
  officePhone: string;
  email: string;
  note: string;
  password?: string;
  confirmPassword?: string;
}

interface EditUserFormProps {
  user: User;
  data: EditUserFormData;
  onChange: (key: keyof EditUserFormData, value: string) => void;
}

export const EditUserForm = ({ user, data, onChange }: EditUserFormProps) => {
  return (
    <div className="flex flex-col">
      {/* Account Section - Username 읽기 전용 */}
      <ModalSection title="Account">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary px-2">
              Username
            </label>
            <div className="bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-text-secondary">
              {user.username}
            </div>
          </div>
        </div>
      </ModalSection>

      {/* Change Password Section - 선택적 */}
      <ModalSection title="Change Password">
        <div className="flex flex-col gap-3">
          <Input
            label="Password"
            type="password"
            placeholder="Enter new password (optional)"
            value={data.password || ''}
            onChange={(v) => onChange('password', v)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={data.confirmPassword || ''}
            onChange={(v) => onChange('confirmPassword', v)}
          />
        </div>
      </ModalSection>

      {/* Business Information Section */}
      <ModalSection title="Business Information">
        <div className="flex flex-col gap-3">
          <Input
            label="Name"
            value={data.name}
            onChange={(v) => onChange('name', v)}
            required
          />
          <Input
            label="Company Name"
            value={data.companyName}
            onChange={(v) => onChange('companyName', v)}
          />
          <Input
            label="Position"
            value={data.position}
            onChange={(v) => onChange('position', v)}
          />
          <Input
            label="Mobile Number"
            type="tel"
            value={data.mobileNumber}
            onChange={(v) => onChange('mobileNumber', v)}
          />
          <Input
            label="Office Phone"
            type="tel"
            value={data.officePhone}
            onChange={(v) => onChange('officePhone', v)}
          />
          <Input
            label="Email"
            type="email"
            value={data.email}
            onChange={(v) => onChange('email', v)}
            required
          />
        </div>
      </ModalSection>

      {/* Note Section */}
      <div className="px-8 py-4 border-b border-border-light">
        <Textarea
          label="Note"
          placeholder="Enter additional notes..."
          value={data.note}
          onChange={(v) => onChange('note', v)}
        />
      </div>
    </div>
  );
};