import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="validation-message" *ngIf="control && control.invalid && (control.dirty || control.touched)">
      <div *ngIf="control.errors?.['required']" class="error-item">
        {{ 'validation.required' | translate }}
      </div>
      <div *ngIf="control.errors?.['invalidChars']" class="error-item">
        {{ 'validation.usernameInvalidChars' | translate }}
      </div>
      <div *ngIf="control.errors?.['invalidLength']" class="error-item">
        {{ 'validation.usernameInvalidLength' | translate }}
      </div>
      <div *ngIf="control.errors?.['passwordStrength']" class="error-item">
        {{ 'validation.passwordStrength' | translate }}
      </div>
    </div>
  `,
  styles: [`
    .validation-message {
      margin-top: 4px;
    }
    
    .error-item {
      color: #ff4d4f;
      font-size: 12px;
      line-height: 1.4;
    }
  `]
})
export class ValidationMessageComponent {
  @Input() control: AbstractControl | null = null;
}
