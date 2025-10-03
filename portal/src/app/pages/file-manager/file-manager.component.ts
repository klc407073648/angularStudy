import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { FileHttpService } from '../../services/file-http.service';
import { AuthHttpService } from '../../services/auth-http.service';
import {
  File,
  FileListRequest,
  FileListResponse,
  CreateFolderRequest,
  RenameFileRequest,
  MoveFileRequest,
  UploadProgress,
  StorageType,
  FileStatus
} from '../../model/file.model';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
    NzModalModule,
    NzDropDownModule,
    NzMenuModule,
    NzLayoutModule,
    NzCardModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzTableModule,
    NzPaginationModule,
    NzTagModule,
    NzToolTipModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzUploadModule
  ],
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements OnInit, OnDestroy {
  files: File[] = [];
  selectedFiles: File[] = [];
  currentFolder: File | null = null;
  breadcrumbs: File[] = [];
  
  // 分页和排序
  totalFiles = 0;
  pageSize = 20;
  pageIndex = 1;
  sortField = 'createdAt';
  sortOrder = 'desc';
  
  // 搜索
  searchKeyword = '';
  
  // 上传相关
  isUploading = false;
  uploadProgress: Map<number, UploadProgress> = new Map();
  selectedStorageType: StorageType = StorageType.Local;
  
  // 表格列
  listOfColumns = [
    {
      title: '选择',
      compare: null,
      priority: false
    },
    {
      title: '名称',
      compare: (a: File, b: File) => a.fileName.localeCompare(b.fileName),
      priority: 3
    },
    {
      title: '大小',
      compare: (a: File, b: File) => a.fileSize - b.fileSize,
      priority: 2
    },
    {
      title: '类型',
      compare: (a: File, b: File) => a.mimeType?.localeCompare(b.mimeType || '') || 0,
      priority: 1
    },
    {
      title: '状态',
      compare: (a: File, b: File) => Number(a.status) - Number(b.status),
      priority: 1
    },
    {
      title: '创建时间',
      compare: (a: File, b: File) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      priority: 2
    },
    {
      title: '操作',
      compare: null,
      priority: false
    }
  ];
  
  // 加载状态
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fileService: FileHttpService,
    private authService: AuthHttpService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadFiles();
    this.subscribeToUploadProgress();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 加载文件列表
   */
  loadFiles(): void {
    this.isLoading = true;
    
    const request: FileListRequest = {
      parentId: this.currentFolder?.id,
      page: this.pageIndex,
      pageSize: this.pageSize,
      keyword: this.searchKeyword || undefined,
      sortBy: this.sortField,
      sortOrder: this.sortOrder
    };

    this.fileService.getFileList(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.files = response.data.files;
            this.totalFiles = response.data.total;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.message.error('加载文件列表失败: ' + error.message);
          this.isLoading = false;
        }
      });
  }

  /**
   * 订阅上传进度
   */
  private subscribeToUploadProgress(): void {
    this.fileService.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progressMap => {
        this.uploadProgress = progressMap;
      });
  }

  /**
   * 上传前处理
   */
  beforeUpload = (file: any): boolean => {
    return false; // 阻止自动上传，手动处理
  }

  /**
   * 文件选择处理
   */
  onFileSelected(event: any): void {
    if (event.type === 'change' && event.fileList) {
      const files = event.fileList.map((file: any) => file.originFileObj).filter((file: any) => file);
      if (files.length > 0) {
        this.uploadFiles(files);
      }
    }
  }

  /**
   * 上传文件
   */
  uploadFiles(files: globalThis.File[]): void {
    this.isUploading = true;
    let completedUploads = 0;

    files.forEach(file => {
      this.fileService.uploadFile(file, this.currentFolder?.id, this.selectedStorageType)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              completedUploads++;
              if (completedUploads === files.length) {
                this.isUploading = false;
                this.loadFiles(); // 重新加载文件列表
                this.message.success('文件上传完成');
              }
            }
          },
          error: (error) => {
            this.message.error('文件上传失败: ' + error.message);
            this.isUploading = false;
          }
        });
    });
  }

  /**
   * 创建文件夹
   */
  createFolder(): void {
    let folderName = '';
    this.modal.create({
      nzTitle: '创建文件夹',
      nzContent: `
        <div>
          <input nz-input [(ngModel)]="folderName" placeholder="请输入文件夹名称" style="width: 100%;">
        </div>
      `,
      nzOnOk: () => {
        if (!folderName.trim()) {
          this.message.error('请输入文件夹名称');
          return false;
        }
        
        const request: CreateFolderRequest = {
          folderName: folderName.trim(),
          parentId: this.currentFolder?.id
        };

        this.fileService.createFolder(request)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.loadFiles();
                this.message.success('文件夹创建成功');
              }
            },
            error: (error) => {
              this.message.error('创建文件夹失败: ' + error.message);
            }
          });
        return true;
      }
    });
  }

  /**
   * 进入文件夹
   */
  enterFolder(folder: File): void {
    this.currentFolder = folder;
    this.breadcrumbs.push(folder);
    this.pageIndex = 1;
    this.loadFiles();
  }

  /**
   * 返回上级目录
   */
  goBack(): void {
    if (this.breadcrumbs.length > 0) {
      this.breadcrumbs.pop();
      this.currentFolder = this.breadcrumbs.length > 0 ? this.breadcrumbs[this.breadcrumbs.length - 1] : null;
    } else {
      this.currentFolder = null;
    }
    this.pageIndex = 1;
    this.loadFiles();
  }

  /**
   * 返回根目录
   */
  goToRoot(): void {
    this.currentFolder = null;
    this.breadcrumbs = [];
    this.pageIndex = 1;
    this.loadFiles();
  }

  /**
   * 重命名文件
   */
  renameFile(file: File): void {
    let newName = file.fileName;
    this.modal.create({
      nzTitle: '重命名文件',
      nzContent: `
        <div>
          <input nz-input [(ngModel)]="newName" placeholder="请输入新名称" style="width: 100%;">
        </div>
      `,
      nzOnOk: () => {
        if (!newName.trim() || newName.trim() === file.fileName) {
          return false;
        }

        const request: RenameFileRequest = {
          fileId: file.id,
          newName: newName.trim()
        };

        this.fileService.renameFile(request)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.loadFiles();
                this.message.success('重命名成功');
              }
            },
            error: (error) => {
              this.message.error('重命名失败: ' + error.message);
            }
          });
        return true;
      }
    });
  }

  /**
   * 删除文件
   */
  deleteFile(file: File): void {
    this.modal.confirm({
      nzTitle: '确认删除',
      nzContent: `确定要删除 "${file.fileName}" 吗？`,
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOnOk: () => {
        this.fileService.deleteFile(file.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.loadFiles();
                this.message.success('删除成功');
              }
            },
            error: (error) => {
              this.message.error('删除失败: ' + error.message);
            }
          });
      }
    });
  }

  /**
   * 下载文件
   */
  downloadFile(file: File): void {
    this.fileService.downloadFile(file.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.fileName;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          this.message.error('下载失败: ' + error.message);
        }
      });
  }

  /**
   * 批量删除
   */
  deleteSelected(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.modal.confirm({
      nzTitle: '确认批量删除',
      nzContent: `确定要删除选中的 ${this.selectedFiles.length} 个文件吗？`,
      nzOkText: '确定',
      nzCancelText: '取消',
      nzOnOk: () => {
        let completedDeletes = 0;
        this.selectedFiles.forEach(file => {
          this.fileService.deleteFile(file.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                if (response.success) {
                  completedDeletes++;
                  if (completedDeletes === this.selectedFiles.length) {
                    this.selectedFiles = [];
                    this.loadFiles();
                    this.message.success('批量删除成功');
                  }
                }
              },
              error: (error) => {
                this.message.error('删除失败: ' + error.message);
              }
            });
        });
      }
    });
  }

  /**
   * 文件选择变化
   */
  onSelectionChange(file: File, checked: boolean): void {
    if (checked) {
      this.selectedFiles.push(file);
    } else {
      this.selectedFiles = this.selectedFiles.filter(f => f.id !== file.id);
    }
  }

  /**
   * 全选/取消全选
   */
  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedFiles = [...this.files];
    } else {
      this.selectedFiles = [];
    }
  }

  /**
   * 检查是否全选
   */
  isAllSelected(): boolean {
    return this.files.length > 0 && this.selectedFiles.length === this.files.length;
  }

  /**
   * 检查是否部分选择
   */
  isIndeterminate(): boolean {
    return this.selectedFiles.length > 0 && this.selectedFiles.length < this.files.length;
  }

  /**
   * 检查文件是否被选中
   */
  isFileSelected(file: File): boolean {
    return this.selectedFiles.some(f => f.id === file.id);
  }

  /**
   * 分页变化
   */
  onPageChange(page: number, pageSize: number): void {
    this.pageIndex = page;
    this.pageSize = pageSize;
    this.loadFiles();
  }

  /**
   * 排序变化
   */
  onSortChange(sort: { key: string; value: string }): void {
    this.sortField = sort.key;
    this.sortOrder = sort.value;
    this.loadFiles();
  }

  /**
   * 搜索
   */
  onSearch(): void {
    this.pageIndex = 1;
    this.loadFiles();
  }

  /**
   * 清空搜索
   */
  clearSearch(): void {
    this.searchKeyword = '';
    this.pageIndex = 1;
    this.loadFiles();
  }

  /**
   * 获取文件图标
   */
  getFileIcon(file: File): string {
    return this.fileService.getFileIcon(file);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(size: number): string {
    return this.fileService.formatFileSize(size);
  }

  /**
   * 获取上传进度
   */
  getUploadProgress(fileId: number): UploadProgress | undefined {
    return this.uploadProgress.get(fileId);
  }

  /**
   * 获取状态文本
   */
  getStatusText(status: FileStatus): string {
    const statusMap = {
      [FileStatus.Uploading]: '上传中',
      [FileStatus.Completed]: '已完成',
      [FileStatus.Failed]: '失败',
      [FileStatus.Deleted]: '已删除'
    };
    return statusMap[status] || '未知';
  }

  /**
   * 获取状态颜色
   */
  getStatusColor(status: FileStatus): string {
    const colorMap = {
      [FileStatus.Uploading]: 'warn',
      [FileStatus.Completed]: 'primary',
      [FileStatus.Failed]: 'warn',
      [FileStatus.Deleted]: 'accent'
    };
    return colorMap[status] || 'primary';
  }

}
