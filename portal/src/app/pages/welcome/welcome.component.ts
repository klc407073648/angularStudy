import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../services/auth.service';
import { User } from '../../model/user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzIconModule,
    NzButtonModule,
    NzTagModule,
    TranslatePipe
  ],
  template: `
    <div class="welcome-container">
      <nz-card [nzBordered]="false" class="welcome-card">
        <div class="welcome-header">
          <h1>{{ 'welcome.title' | translate }}</h1>
          <p>{{ 'welcome.greeting' | translate: {name: currentUser?.name || currentUser?.username} }}</p>
        </div>
        
        <div class="user-info">
          <nz-card [nzTitle]="'welcome.userInfo' | translate" [nzBordered]="false" class="info-card">
            <div class="info-item">
              <i nz-icon nzType="user" nzTheme="outline"></i>
              <span>{{ 'welcome.username' | translate }}{{ currentUser?.username }}</span>
            </div>
            <div class="info-item">
              <i nz-icon nzType="mail" nzTheme="outline"></i>
              <span>{{ 'welcome.email' | translate }}{{ currentUser?.email }}</span>
            </div>
            <div class="info-item">
              <i nz-icon nzType="safety-certificate" nzTheme="outline"></i>
              <span>{{ 'welcome.role' | translate }}</span>
              <nz-tag [nzColor]="currentUser?.role === 'admin' ? 'red' : 'blue'">
                {{ currentUser?.role === 'admin' ? ('common.admin' | translate) : ('common.user' | translate) }}
              </nz-tag>
            </div>
          </nz-card>
        </div>

        <div class="permissions-info" *ngIf="currentUser?.role === 'user'">
          <nz-card [nzTitle]="'welcome.availableFeatures' | translate" [nzBordered]="false" class="info-card">
            <div class="permission-item">
              <i nz-icon nzType="check-circle" nzTheme="fill" style="color: #52c41a;"></i>
              <span>{{ 'welcome.viewUserList' | translate }}</span>
            </div>
            <div class="permission-item">
              <i nz-icon nzType="check-circle" nzTheme="fill" style="color: #52c41a;"></i>
              <span>{{ 'welcome.viewWelcomePage' | translate }}</span>
            </div>
            <div class="permission-item">
              <i nz-icon nzType="close-circle" nzTheme="fill" style="color: #ff4d4f;"></i>
              <span>{{ 'welcome.roleManagementAdminOnly' | translate }}</span>
            </div>
            <div class="permission-item">
              <i nz-icon nzType="close-circle" nzTheme="fill" style="color: #ff4d4f;"></i>
              <span>{{ 'welcome.permissionSettingsAdminOnly' | translate }}</span>
            </div>
          </nz-card>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .welcome-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .welcome-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .welcome-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .welcome-header h1 {
      color: #1890ff;
      margin-bottom: 8px;
    }

    .welcome-header p {
      font-size: 16px;
      color: #666;
    }

    .user-info, .permissions-info {
      margin-bottom: 24px;
    }

    .info-card {
      background: #fafafa;
    }

    .info-item, .permission-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    }

    .info-item i, .permission-item i {
      font-size: 16px;
    }
  `]
})
export class WelcomeComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private i18nService: I18nService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
