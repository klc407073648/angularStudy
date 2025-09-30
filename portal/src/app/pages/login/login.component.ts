import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../model/user.model';
import { passwordValidator, usernameValidator } from '../../common/validator';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { I18nService } from '../../services/i18n.service';
import { ValidationMessageComponent } from '../../components/validation-message/validation-message.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputGroupComponent,
    NzButtonModule,
    NzCardModule,
    NzMessageModule,
    NzIconModule,
    TranslatePipe,
    ValidationMessageComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  loading = false;
  passwordVisible = false;

  constructor(
    private authService: AuthService,
    private message: NzMessageService,
    private router: Router,
    private fb: FormBuilder,
    private i18nService: I18nService
  ) {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required, usernameValidator]],
      password: [null, [Validators.required, passwordValidator]],
      remember: [true],
    });
  }

  onSubmit(): void {
    if (
      !this.loginForm.get('username')?.value ||
      !this.loginForm.get('password')?.value
    ) {
      this.message.error(this.i18nService.translate('login.fillCompleteInfo'));
      return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.value as LoginRequest).subscribe({
      next: (result) => {
        this.loading = false;
        if (result.success) {
          this.message.success(
            this.i18nService.translate('login.loginSuccess')
          );
          // 根据用户角色重定向到不同页面
          if (result.user?.role === 'admin') {
            this.router.navigate(['/manage']);
          } else {
            this.router.navigate(['/welcome']);
          }
        } else {
          this.message.error(
            this.i18nService.translate('login.invalidCredentials')
          );
        }
      },
      error: () => {
        this.loading = false;
        this.message.error(this.i18nService.translate('login.loginFailed'));
      },
    });
  }
}
