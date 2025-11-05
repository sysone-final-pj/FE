import type { User } from '@/entities/user/model/types';

export const  mockUsers: User[] = [
  {
    id: 1,
    username: 'whale',
    name: '김고래',
    position: '팀장',
    companyName: '농심 고래밥 주식회사',
    mobileNumber: '010-1234-1234',
    officePhone: '02-1234-1234',
    email: 'whale@nongshim.com',
    note: '',
  },
  {
    id: 2,
    username: 'penguin',
    name: '이펭귄',
    position: '매니저',
    companyName: '빙하주식회사',
    mobileNumber: '010-5678-5678',
    officePhone: '02-5678-5678',
    email: 'penguin@ice.com',
    note: '',
  },
];
