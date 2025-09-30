import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false, // 设置为非纯管道以支持动态语言切换
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription = new Subscription();
  private lastKey: string = '';
  private lastParams: any = null;
  private lastValue: string = '';
  private currentLanguage: string = '';

  constructor(private i18nService: I18nService) {
    // 监听语言变化
    this.subscription.add(
      this.i18nService.currentLanguage$.subscribe((lang) => {
        this.currentLanguage = lang;
        // 语言变化时清空缓存
        this.lastKey = '';
        this.lastValue = '';
      })
    );
  }

  transform(key: string, params?: { [key: string]: any }): string {
    // 获取当前语言
    const currentLang = this.i18nService.getCurrentLanguage();

    // 如果键、参数和语言都没有变化，返回缓存的值
    if (
      key === this.lastKey &&
      JSON.stringify(params) === JSON.stringify(this.lastParams) &&
      currentLang === this.currentLanguage
    ) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastParams = params;
    this.currentLanguage = currentLang;
    this.lastValue = this.i18nService.translate(key, params);

    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
