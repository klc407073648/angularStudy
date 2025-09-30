import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { I18nService, SupportedLanguage } from '../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzButtonModule,
    NzIconModule,
    NzMenuModule,
  ],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LanguageSwitcherComponent implements OnInit {
  currentLanguage: SupportedLanguage = 'zh';
  supportedLanguages: SupportedLanguage[] = [];

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    this.supportedLanguages = this.i18nService.getSupportedLanguages();

    // 监听语言变化
    this.i18nService.currentLanguage$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  changeLanguage(language: SupportedLanguage): void {
    this.i18nService.setLanguage(language);
  }

  getCurrentLanguageFlag(): string {
    return this.i18nService.getLanguageFlag(this.currentLanguage);
  }

  getCurrentLanguageName(): string {
    return this.i18nService.getLanguageDisplayName(this.currentLanguage);
  }

  getLanguageFlag(language: SupportedLanguage): string {
    return this.i18nService.getLanguageFlag(language);
  }

  getLanguageDisplayName(language: SupportedLanguage): string {
    return this.i18nService.getLanguageDisplayName(language);
  }
}
