import { Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';

export const routes: Routes = [
  { path: 'index', component: MenuComponent },
  { path: '', pathMatch: 'full', redirectTo: '/index' },
  // { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.routes').then((m) => m.WELCOME_ROUTES),
  },
  {
    path: 'manage',
    loadChildren: () =>
      import('./pages/manage/manage.routes').then((m) => m.MANAGE_ROUTES),
  },
];
