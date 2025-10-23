import { Input } from '@/shared/ui/Input/Input';
import { Textarea } from '@/shared/ui/Textarea/Textarea';
import { ModalSection } from '@/shared/ui/ModalSection/ModalSection';
import { UsernameInput } from '@/features/user/ui/UsernameInput/UsernameInput';
import type { AddUserFormData } from '@/features/user/model/addUserFormData';


interface AddUserFormProps {
  data: AddUserFormData;
  onChange: (key: keyof AddUserFormData, value: string) => void;
  onCheckUsername: () => void;
  isChecking: boolean;
  isAvailable: boolean | null;
}

export const AddUserForm = ({
  data,
  onChange,
  onCheckUsername,
  isChecking,
  isAvailable,
}: AddUserFormProps) => {
  return (
    <div className="flex flex-col">
      <ModalSection title="Account Info">
        <div className="flex flex-col gap-3">
          <UsernameInput
            value={data.username}
            onChange={(v) => onChange('username', v)}
            onCheckId={onCheckUsername}
            isChecking={isChecking}
            isAvailable={isAvailable}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={data.password}
            onChange={(v) => onChange('password', v)}
            required
          />
        </div>
      </ModalSection>

      <ModalSection title="Business Info">
        <div className="flex flex-col gap-3">
          <Input label="Name" value={data.name} onChange={(v) => onChange('name', v)} required />
          <Input label="Company" value={data.company} onChange={(v) => onChange('company', v)} />
          <Input label="Position" value={data.position} onChange={(v) => onChange('position', v)} />
          <Input label="Mobile" type="tel" value={data.mobile} onChange={(v) => onChange('mobile', v)} />
          <Input label="Office Phone" type="tel" value={data.office} onChange={(v) => onChange('office', v)} />
          <Input label="Email" type="email" value={data.email} onChange={(v) => onChange('email', v)} required />
        </div>
      </ModalSection>

      <div className="px-8 py-4 border-b border-gray-200">
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
