import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { TranslateModule } from '@ngx-translate/core';
import { QiankunService } from '../../services/qiankun.service';

@Component({
  selector: 'app-vue-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzSpinModule,
    NzAlertModule,
    TranslateModule,
  ],
  template: `
    <div class="vue-settings-container">
      <div class="header">
        <h2>{{ 'navigation.systemSettings' | translate }}</h2>
        <button nz-button nzType="primary" routerLink="/welcome">
          <i nz-icon nzType="arrow-left"></i>
          {{ 'common.back' | translate }}
        </button>
      </div>
      
      <div class="status-section" *ngIf="showDebugInfo">
        <nz-card [nzTitle]="'Vue应用状态'" [nzBordered]="false" class="status-card">
          <p><strong>加载状态:</strong> {{ loadingStatus }}</p>
          <div class="debug-buttons">
            <button nz-button nzType="default" (click)="testLoadVue()" [nzLoading]="isLoading">
              测试加载Vue应用
            </button>
            <button nz-button nzType="primary" (click)="directLoadVue()" [nzLoading]="isLoading">
              直接加载Vue应用
            </button>
          </div>
        </nz-card>
      </div>

      <div class="loading-section" *ngIf="isLoading">
        <nz-spin [nzSize]="'large'" [nzTip]="'正在加载Vue应用...'">
          <div class="loading-placeholder"></div>
        </nz-spin>
      </div>

      <div class="error-section" *ngIf="errorMessage">
        <nz-alert
          [nzType]="'error'"
          [nzMessage]="'加载失败'"
          [nzDescription]="errorMessage"
          [nzShowIcon]="true"
          (nzOnClose)="errorMessage = ''"
        ></nz-alert>
      </div>
      
      <div #vueContainer id="vue-settings-container" class="vue-container" [class.hidden]="isLoading"></div>
    </div>
  `,
  styles: [`
    .vue-settings-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #f0f0f0;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .status-section {
      padding: 16px 24px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .status-card {
      margin-bottom: 0;
    }
    
    .debug-buttons {
      margin-top: 12px;
      display: flex;
      gap: 8px;
    }
    
    .loading-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
    }
    
    .loading-placeholder {
      width: 200px;
      height: 200px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .error-section {
      padding: 16px 24px;
      background: #fff;
    }
    
    .vue-container {
      flex: 1;
      overflow: hidden;
      background: #fff;
      transition: opacity 0.3s ease;
    }
    
    .vue-container.hidden {
      opacity: 0;
    }
  `]
})
export class VueSettingsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('vueContainer', { static: true }) vueContainer!: ElementRef;
  loadingStatus = '未开始';
  isLoading = false;
  errorMessage = '';
  showDebugInfo = true; // 设置为 false 可以隐藏调试信息

  constructor(
    private qiankunService: QiankunService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('VueSettingsComponent ngOnInit called');
    this.loadingStatus = '组件已初始化';
    
    // 测试qiankun服务是否可用
    console.log('QiankunService available:', !!this.qiankunService);
    
    // 只在浏览器环境中监听消息
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  ngAfterViewInit() {
    console.log('VueSettingsComponent ngAfterViewInit called');
    this.loadingStatus = '视图已初始化';
    
    // 延迟加载Vue应用，确保容器已渲染
    setTimeout(() => {
      console.log('Starting to load Vue app...');
      this.loadVueApp();
    }, 100);
  }

  ngOnDestroy() {
    // 清理Vue应用
    this.qiankunService.unmountVueSettingsApp();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
  }

  async testLoadVue() {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingStatus = '正在测试加载...';
    try {
      await this.loadVueApp();
    } finally {
      this.isLoading = false;
    }
  }

  async directLoadVue() {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadingStatus = '直接加载Vue应用...';
    try {
      // 直接通过iframe加载Vue应用
      const container = document.querySelector('#vue-settings-container');
      if (container) {
        container.innerHTML = '<iframe src="http://localhost:8081" width="100%" height="100%" frameborder="0"></iframe>';
        this.loadingStatus = 'Vue应用已通过iframe加载';
      }
    } catch (error) {
      console.error('直接加载Vue应用失败:', error);
      this.loadingStatus = '直接加载失败: ' + error;
      this.errorMessage = error instanceof Error ? error.message : String(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadVueApp() {
    try {
      console.log('Loading Vue app into container: #vue-settings-container');
      this.loadingStatus = '正在加载Vue应用...';
      
      // 检查容器元素是否存在
      const container = document.querySelector('#vue-settings-container');
      console.log('Container element found:', !!container);
      
      if (!container) {
        console.error('Container element #vue-settings-container not found');
        this.loadingStatus = '容器元素未找到';
        this.errorMessage = '容器元素未找到';
        return;
      }
      
      const result = await this.qiankunService.loadVueSettingsApp('#vue-settings-container');
      console.log('Vue app loaded successfully:', result);
      
      if (result) {
        this.loadingStatus = 'Vue应用加载成功';
        this.errorMessage = '';
      } else {
        this.loadingStatus = 'Vue应用加载失败';
        this.errorMessage = 'Vue应用加载失败，请检查Vue应用是否在8081端口运行';
      }
    } catch (error) {
      console.error('加载Vue应用失败:', error);
      this.loadingStatus = '加载失败: ' + error;
      this.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  private handleMessage(event: MessageEvent) {
    console.log('Received message:', event.data);
    
    if (event.data && event.data.type === 'NAVIGATE_TO_MAIN') {
      this.goBack();
    } else if (event.data && event.data.type === 'ROUTE_CHANGE') {
      // 处理Vue应用的路由变化
      console.log('Vue route changed to:', event.data.path);
      // 更新Angular路由
      if (isPlatformBrowser(this.platformId)) {
        // 使用replaceState避免在浏览器历史中创建新条目
        window.history.replaceState(null, '', event.data.path);
      }
    }
  }

  goBack() {
    // 返回主应用 - 现在使用 routerLink，这个方法可能不会被调用
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    }
  }
}