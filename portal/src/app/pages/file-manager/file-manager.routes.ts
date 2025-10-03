import { Routes } from '@angular/router';
import { FileManagerComponent } from './file-manager.component';

export const fileManagerRoutes: Routes = [
  {
    path: '',
    component: FileManagerComponent,
    title: '文件管理'
  }
];
