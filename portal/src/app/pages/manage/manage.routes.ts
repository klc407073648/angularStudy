import { Routes } from '@angular/router';
import { ManageComponent } from './manage.component';

export const MANAGE_ROUTES: Routes = [
  { path: '', component: ManageComponent, data: { module: 'manage' } },
];
