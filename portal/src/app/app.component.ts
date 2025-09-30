// app.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { MENU_CONFIG, MenuItem } from './conf/menu.config';
import { filter } from 'rxjs/operators';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { User } from './model/user.model';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { TranslatePipe } from './pipes/translate.pipe';
import { I18nService } from './services/i18n.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterLink,
    RouterOutlet,
    NzButtonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzToolTipModule,
    NzDropDownModule,
    NzAvatarModule,
    LanguageSwitcherComponent,
    TranslatePipe,
    NgIf,
    NgFor,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  currentModule: string | null = null;
  sidebarMenu: MenuItem[] = [];
  isCollapsed = false;
  currentUser: User | null = null;

  // 模块标题映射
  private moduleTitles: { [key: string]: string } = {
    manage: '用户管理',
    orders: '订单管理',
    settings: '系统设置',
  };

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    // 监听用户状态变化
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // 监听路由变化
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebar();
      });

    // 初始化（首次加载）
    this.updateSidebar();
  }

  private updateSidebar() {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    // 获取当前路由的 data.module
    const data = route.snapshot.data;
    const module = data['module'];

    if (module && MENU_CONFIG[module]) {
      this.currentModule = module;
      // 根据用户权限过滤菜单
      this.sidebarMenu = this.filterMenuByPermission(MENU_CONFIG[module]);
    } else {
      this.currentModule = null;
      this.sidebarMenu = [];
    }
  }

  private filterMenuByPermission(menuItems: MenuItem[]): MenuItem[] {
    if (!this.currentUser) return [];

    return menuItems.filter((item) => {
      // 检查角色权限
      if (item.roles && !item.roles.includes(this.currentUser!.role)) {
        return false;
      }

      // 检查具体权限
      if (item.permission && !this.authService.hasPermission(item.permission)) {
        return false;
      }

      return true;
    });
  }

  getModuleTitle(): string {
    return this.moduleTitles[this.currentModule!] || '未知模块';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserDisplayName(): string {
    return this.currentUser?.name || this.currentUser?.username || '未知用户';
  }

  getUserRoleText(): string {
    return this.currentUser?.role === 'admin'
      ? this.i18nService.translate('common.admin')
      : this.i18nService.translate('common.user');
  }
}
