// app.component.ts
import { Component, OnInit } from '@angular/core';
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
import { MenuComponent } from './menu/menu.component';
import { NgFor, NgIf } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';

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
    MenuComponent,
    NgIf,
    NgFor,
    NzToolTipModule,
  ],
})
export class AppComponent implements OnInit {
  currentModule: string | null = null;
  sidebarMenu: MenuItem[] = [];
  isCollapsed = false;

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
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
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

    console.log('sidebarMenu data:', data);

    console.log('sidebarMenu module:', module);

    if (module && MENU_CONFIG[module]) {
      this.currentModule = module;
      this.sidebarMenu = MENU_CONFIG[module];
    } else {
      this.currentModule = null;
      this.sidebarMenu = [];
    }
    console.log('sidebarMenu:', this.sidebarMenu);
  }

  getModuleTitle(): string {
    return this.moduleTitles[this.currentModule!] || '未知模块';
  }
}
