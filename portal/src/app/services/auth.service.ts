import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginRequest, User, UserRole } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // 模拟用户数据
  private users: User[] = [
    {
      id: 1,
      username: UserRole.Admin,
      password: 'admin123',
      email: 'admin@example.com',
      role: UserRole.Admin,
      name: '管理员',
    },
    {
      id: 2,
      username: UserRole.User,
      password: 'user123',
      email: 'user@example.com',
      role: UserRole.User,
      name: '普通用户',
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // 检查本地存储中是否有用户信息（仅在浏览器环境中）
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(
    credentials: LoginRequest
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable((observer) => {
      setTimeout(() => {
        const user = this.users.find(
          (u) =>
            u.username === credentials.username &&
            (u as any).password === credentials.password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user as any;
          this.currentUserSubject.next(userWithoutPassword);
          // 仅在浏览器环境中保存到localStorage
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(
              'currentUser',
              JSON.stringify(userWithoutPassword)
            );
          }
          observer.next({
            success: true,
            message: '登录成功',
            user: userWithoutPassword,
          });
        } else {
          observer.next({ success: false, message: '用户名或密码错误' });
        }
        observer.complete();
      }, 1000); // 模拟网络延迟
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    // 仅在浏览器环境中清除localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === UserRole.Admin;
  }

  isUser(): boolean {
    return this.currentUserSubject.value?.role === UserRole.User;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // 管理员拥有所有权限
    if (user.role === UserRole.Admin) return true;

    // 普通用户权限检查
    const userPermissions = this.getUserPermissions(user.role);
    return userPermissions.includes(permission);
  }

  private getUserPermissions(role: string): string[] {
    const permissions: { [key: string]: string[] } = {
      admin: ['*'], // 管理员拥有所有权限
      user: ['manage.list.view', 'welcome.view'],
    };
    return permissions[role] || [];
  }
}
