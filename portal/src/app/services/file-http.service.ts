import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  File,
  FileUploadRequest,
  ChunkUploadRequest,
  FileListRequest,
  FileListResponse,
  CreateFolderRequest,
  RenameFileRequest,
  MoveFileRequest,
  UploadProgress,
  StorageType,
  FileStatus
} from '../model/file.model';
import { ApiResponse } from '../model/api.model';

@Injectable({
  providedIn: 'root'
})
export class FileHttpService {
  private readonly API_BASE_URL = 'http://localhost:3000/api';
  private readonly CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  private uploadProgressSubject = new BehaviorSubject<Map<number, UploadProgress>>(new Map());
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  /**
   * 创建文件上传记录
   */
  createFile(request: FileUploadRequest): Observable<ApiResponse<File>> {
    return this.http.post<ApiResponse<File>>(`${this.API_BASE_URL}/files/create`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * 上传文件分片
   */
  uploadChunk(request: ChunkUploadRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_BASE_URL}/files/chunk`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * 获取文件列表
   */
  getFileList(request: FileListRequest): Observable<ApiResponse<FileListResponse>> {
    return this.http.get<ApiResponse<FileListResponse>>(`${this.API_BASE_URL}/files/list`, {
      params: request as any
    }).pipe(catchError(this.handleError));
  }

  /**
   * 创建文件夹
   */
  createFolder(request: CreateFolderRequest): Observable<ApiResponse<File>> {
    return this.http.post<ApiResponse<File>>(`${this.API_BASE_URL}/files/folder`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * 删除文件
   */
  deleteFile(fileId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_BASE_URL}/files/${fileId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 重命名文件
   */
  renameFile(request: RenameFileRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_BASE_URL}/files/rename`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * 移动文件
   */
  moveFile(request: MoveFileRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_BASE_URL}/files/move`, request)
      .pipe(catchError(this.handleError));
  }

  /**
   * 获取上传进度
   */
  getUploadProgress(fileId: number): Observable<ApiResponse<UploadProgress>> {
    return this.http.get<ApiResponse<UploadProgress>>(`${this.API_BASE_URL}/files/progress/${fileId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 下载文件
   */
  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.API_BASE_URL}/files/download/${fileId}`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * 获取文件信息
   */
  getFileInfo(fileId: number): Observable<ApiResponse<File>> {
    return this.http.get<ApiResponse<File>>(`${this.API_BASE_URL}/files/info/${fileId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 上传文件（支持大文件分片上传）
   */
  uploadFile(
    file: globalThis.File,
    parentId?: number,
    storageType: StorageType = StorageType.Local,
    onProgress?: (progress: UploadProgress) => void
  ): Observable<ApiResponse<File>> {
    return new Observable(observer => {
      // 验证文件大小
      if (file.size > this.MAX_FILE_SIZE) {
        observer.error(new Error('文件大小超出限制'));
        return;
      }

      // 计算文件哈希
      this.calculateFileHash(file).then(hash => {
        // 计算分片数量
        const chunkCount = Math.ceil(file.size / this.CHUNK_SIZE);

        // 创建文件上传记录
        const uploadRequest: FileUploadRequest = {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          parentId,
          hash,
          chunkCount,
          storageType
        };

        this.createFile(uploadRequest).subscribe({
          next: (response) => {
            if (response.success && response.data) {
              const fileRecord = response.data;
              this.uploadFileChunks(file, fileRecord, onProgress).subscribe({
                next: (result) => observer.next(result),
                error: (error) => observer.error(error),
                complete: () => observer.complete()
              });
            } else {
              observer.error(new Error(response.message || '创建文件记录失败'));
            }
          },
          error: (error) => observer.error(error)
        });
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * 上传文件分片
   */
  private uploadFileChunks(
    file: globalThis.File,
    fileRecord: File,
    onProgress?: (progress: UploadProgress) => void
  ): Observable<ApiResponse<File>> {
    return new Observable(observer => {
      let uploadedChunks = 0;
      const totalChunks = fileRecord.chunkCount;

      const uploadNextChunk = (chunkIndex: number) => {
        if (chunkIndex >= totalChunks) {
          // 所有分片上传完成
          observer.next({ success: true, message: '上传完成', data: fileRecord });
          observer.complete();
          return;
        }

        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        this.fileToBase64(chunk).then(base64Data => {
          const chunkRequest: ChunkUploadRequest = {
            fileId: fileRecord.id,
            chunkIndex,
            chunkData: base64Data
          };

          this.uploadChunk(chunkRequest).subscribe({
            next: (response) => {
              if (response.success) {
                uploadedChunks++;
                const progress: UploadProgress = {
                  fileId: fileRecord.id,
                  fileName: fileRecord.fileName,
                  totalSize: fileRecord.fileSize,
                  uploadedSize: uploadedChunks * this.CHUNK_SIZE,
                  progress: (uploadedChunks / totalChunks) * 100,
                  status: uploadedChunks === totalChunks ? FileStatus.Completed : FileStatus.Uploading
                };

                // 更新进度
                const progressMap = this.uploadProgressSubject.value;
                progressMap.set(fileRecord.id, progress);
                this.uploadProgressSubject.next(progressMap);

                if (onProgress) {
                  onProgress(progress);
                }

                // 上传下一个分片
                uploadNextChunk(chunkIndex + 1);
              } else {
                observer.error(new Error(response.message || '分片上传失败'));
              }
            },
            error: (error) => observer.error(error)
          });
        }).catch(error => {
          observer.error(error);
        });
      };

      // 开始上传第一个分片
      uploadNextChunk(0);
    });
  }

  /**
   * 计算文件MD5哈希
   */
  private async calculateFileHash(file: globalThis.File): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('MD5', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 将文件转换为Base64
   */
  private fileToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除data:前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取文件图标
   */
  getFileIcon(file: File): string {
    if (file.isFolder) {
      return 'folder';
    }

    const ext = file.fileName.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'ppt': 'slideshow',
      'pptx': 'slideshow',
      'txt': 'text_snippet',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'bmp': 'image',
      'svg': 'image',
      'mp4': 'video_file',
      'avi': 'video_file',
      'mov': 'video_file',
      'wmv': 'video_file',
      'flv': 'video_file',
      'mp3': 'audio_file',
      'wav': 'audio_file',
      'flac': 'audio_file',
      'aac': 'audio_file',
      'zip': 'archive',
      'rar': 'archive',
      '7z': 'archive',
      'tar': 'archive',
      'gz': 'archive'
    };

    return iconMap[ext || ''] || 'insert_drive_file';
  }

  /**
   * 错误处理
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = '发生未知错误';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `客户端错误: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = '未授权，请重新登录';
      } else if (error.status === 403) {
        errorMessage = '权限不足';
      } else if (error.status === 404) {
        errorMessage = '请求的资源不存在';
      } else if (error.status >= 500) {
        errorMessage = '服务器内部错误';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('文件服务错误:', error);
    return throwError(() => new Error(errorMessage));
  };
}
