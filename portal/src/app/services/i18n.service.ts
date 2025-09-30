import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Translation {
  [key: string]: any;
}

export type SupportedLanguage = 'zh' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('zh');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();
  
  private translations: { [key: string]: Translation } = {};
  private readonly defaultLanguage: SupportedLanguage = 'zh';
  private readonly supportedLanguages: SupportedLanguage[] = ['zh', 'en'];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 从本地存储获取语言设置（仅在浏览器环境中）
    if (isPlatformBrowser(this.platformId)) {
      const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
      if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
        this.currentLanguageSubject.next(savedLanguage);
      }
    }
    
    // 立即加载默认翻译（避免异步加载问题）
    this.translations[this.currentLanguageSubject.value] = this.getDefaultTranslations(this.currentLanguageSubject.value);
    
    // 在浏览器环境中异步加载完整翻译文件
    if (isPlatformBrowser(this.platformId)) {
      this.loadTranslations(this.currentLanguageSubject.value);
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  /**
   * 设置语言
   */
  setLanguage(language: SupportedLanguage): void {
    if (this.supportedLanguages.includes(language)) {
      // 立即设置默认翻译，避免显示空白
      this.translations[language] = this.getDefaultTranslations(language);
      this.currentLanguageSubject.next(language);
      
      // 仅在浏览器环境中保存到localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('preferredLanguage', language);
        // 异步加载完整翻译文件
        this.loadTranslations(language);
      }
    }
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return [...this.supportedLanguages];
  }

  /**
   * 获取翻译文本
   */
  translate(key: string, params?: { [key: string]: any }): string {
    const currentLang = this.currentLanguageSubject.value;
    
    // 确保当前语言的翻译已加载
    if (!this.translations[currentLang]) {
      this.translations[currentLang] = this.getDefaultTranslations(currentLang);
    }
    
    const translation = this.getTranslationByKey(key);
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${currentLang}`);
      return key;
    }

    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  /**
   * 获取翻译文本的Observable
   */
  translateAsync(key: string, params?: { [key: string]: any }): Observable<string> {
    return this.currentLanguage$.pipe(
      map(() => this.translate(key, params))
    );
  }

  /**
   * 检查是否有翻译
   */
  hasTranslation(key: string): boolean {
    return this.getTranslationByKey(key) !== null;
  }

  /**
   * 加载翻译文件
   */
  private loadTranslations(language: SupportedLanguage): void {
    if (this.translations[language]) {
      return; // 已经加载过了
    }

    // 在SSR环境中，直接使用默认翻译，避免HTTP请求
    if (!isPlatformBrowser(this.platformId)) {
      this.translations[language] = this.getDefaultTranslations(language);
      return;
    }

    this.http.get<Translation>(`/assets/i18n/${language}.json`)
      .pipe(
        catchError(error => {
          console.error(`Failed to load translations for ${language}:`, error);
          // 如果加载失败，使用默认翻译
          this.translations[language] = this.getDefaultTranslations(language);
          return of({});
        })
      )
      .subscribe(translations => {
        this.translations[language] = translations;
      });
  }

  private getDefaultTranslations(language: SupportedLanguage): Translation {
    // 返回基本的翻译内容，避免在SSR中加载失败
    if (language === 'zh') {
      return {
        common: {
          login: '登录',
          logout: '退出登录',
          username: '用户名',
          password: '密码',
          admin: '管理员',
          user: '普通用户'
        },
        navigation: {
          userManagement: '用户管理',
          orderManagement: '订单管理',
          systemSettings: '系统设置'
        },
        login: {
          title: '系统登录',
          subtitle: '请输入您的登录凭据',
          usernamePlaceholder: '请输入用户名',
          passwordPlaceholder: '请输入密码',
          loginButton: '登录',
          testAccounts: '测试账号：',
          adminAccount: '管理员：admin / admin123',
          userAccount: '普通用户：user / user123'
        }
      };
    } else {
      return {
        common: {
          login: 'Login',
          logout: 'Logout',
          username: 'Username',
          password: 'Password',
          admin: 'Administrator',
          user: 'User'
        },
        navigation: {
          userManagement: 'User Management',
          orderManagement: 'Order Management',
          systemSettings: 'System Settings'
        },
        login: {
          title: 'System Login',
          subtitle: 'Please enter your login credentials',
          usernamePlaceholder: 'Please enter username',
          passwordPlaceholder: 'Please enter password',
          loginButton: 'Login',
          testAccounts: 'Test accounts:',
          adminAccount: 'Admin: admin / admin123',
          userAccount: 'User: user / user123'
        }
      };
    }
  }

  /**
   * 根据键获取翻译
   */
  private getTranslationByKey(key: string): string | null {
    const currentLang = this.currentLanguageSubject.value;
    const translation = this.getNestedValue(this.translations[currentLang], key);
    return translation || null;
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * 插值替换
   */
  private interpolate(text: string, params: { [key: string]: any }): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * 获取语言显示名称
   */
  getLanguageDisplayName(language: SupportedLanguage): string {
    const displayNames: { [key in SupportedLanguage]: string } = {
      'zh': '中文',
      'en': 'English'
    };
    return displayNames[language];
  }

  /**
   * 获取语言标志
   */
  getLanguageFlag(language: SupportedLanguage): string {
    const flags: { [key in SupportedLanguage]: string } = {
      'zh': '🇨🇳',
      'en': '🇺🇸'
    };
    return flags[language];
  }
}
