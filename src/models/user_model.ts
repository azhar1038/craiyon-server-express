type Role = 'USER' | 'MEMBER' | 'ADMIN';

export type UserModel = {
  id: number;
  name: string;
  email: string;
  role?: Role;
};
