// API 响应基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: number;
}

// 登录响应接口
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// 用户信息响应接口
export interface UserInfoResponse {
  user: User;
  permissions: string[];
}

// 刷新令牌请求接口
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 刷新令牌响应接口
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// 从 user.model.ts 导入 User 类型
import { User } from './user.model';
