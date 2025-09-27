import { Routes } from '@angular/router';
import { ManageComponent } from './manage.component';
import { ListComponent } from './list/list.component';
import { PermissionComponent } from './permission/permission.component';
import { RoleComponent } from './roles/role.component';

export const MANAGE_ROUTES: Routes = [
  { path: '', component: ManageComponent, data: { module: 'manage' } },
  { path: 'list', component: ListComponent, data: { module: 'manage' } },
  { path: 'roles', component: RoleComponent, data: { module: 'manage' } },
  { path: 'permissions', component: PermissionComponent, data: { module: 'manage' } },
];
