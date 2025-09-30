import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES),
  },
  {
    path: 'index',
    component: MenuComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/index',
  },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'manage',
    loadChildren: () =>
      import('./pages/manage/manage.routes').then((m) => m.MANAGE_ROUTES),
    canActivate: [AuthGuard, AdminGuard],
  },
];
