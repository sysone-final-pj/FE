import type { AddUserFormData } from '@/features/user/model/addUserFormData';
import type { User } from '@/entities/user/model/types';

export const mapUserToFormData = (user: User): AddUserFormData => ({
  username: user.username,
  password: '',
  name: user.name,
  company: user.companyName,
  position: user.position,
  mobile: user.mobileNumber,
  office: user.officePhone,
  email: user.email,
  note: user.note,
});

