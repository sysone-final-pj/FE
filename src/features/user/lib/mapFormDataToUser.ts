import type { AddUserFormData } from '@/features/user/model/addUserFormData';
import type { User } from '@/entities/user/model/types';

// Form → User 변환
export const mapFormDataToUser = (form: AddUserFormData): User => ({
  // id: form.id || String(Date.now()),
  username: form.username,
  name: form.name,
  companyName: form.company,
  position: form.position,
  mobileNumber: form.mobile,
  officePhone: form.office,
  email: form.email,
  note: form.note,
});
