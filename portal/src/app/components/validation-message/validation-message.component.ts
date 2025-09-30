import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css'],
})
export class ValidationMessageComponent {
  @Input() control: AbstractControl | null = null;
}
