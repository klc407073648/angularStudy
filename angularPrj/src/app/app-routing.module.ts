import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {AppComponent} from "./app.component"

import {IndexComponent} from "./view/index/index.component"
import {AboutComponent} from "./view/about/about.component"
import {NewsComponent} from "./view/news/news.component"
import {Page404Component}  from "./view/page404/page404.component"

import { ConfigComponent } from './config/config.component';
import { DownloaderComponent } from './downloader/downloader.component';
import { HeroesComponent } from './heroes/heroes.component';
import { HttpErrorHandler } from './http-error-handler.service';
import { MessageService } from './message.service';
import { MessagesComponent } from './messages/messages.component';
import { PackageSearchComponent } from './package-search/package-search.component';
import { UploaderComponent } from './uploader/uploader.component';
import { HttpServiceComponent } from './view/http-service/http-service.component'
import { MaterialTestComponent } from './view/material-test/material-test.component';

const routes: Routes = [
  {
    path:"index",
    component:IndexComponent
  },
  {
    path:"about",
    component:AboutComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
  {
    path:"news",
    component:NewsComponent
  },
  {
    path:"material-test",
    component:MaterialTestComponent
  },
  {
    path:"heroes",
    component:HeroesComponent
  },
  {
    path:"messages",
    component:MessagesComponent
  },
  {
    path:"config",
    component:ConfigComponent
  },
  {
    path:"downloader",
    component:DownloaderComponent
  },
  {
    path:"uploader",
    component:UploaderComponent
  },
  {
    path:"package-search",
    component:PackageSearchComponent
  },
  {
    path:"httpService",
    component:HttpServiceComponent
  },
  {
    path:"**",
    component:Page404Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
