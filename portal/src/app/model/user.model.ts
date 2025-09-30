export enum UserRole {
  Admin = 'admin',
  User = 'user'
}

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
