package models

import "time"

// 文件存储类型
type StorageType string

const (
	StorageLocal StorageType = "local" // 本地存储
	StorageSFTP  StorageType = "sftp"  // SFTP存储
)

// 文件状态
type FileStatus string

const (
	FileStatusUploading FileStatus = "uploading" // 上传中
	FileStatusCompleted FileStatus = "completed" // 已完成
	FileStatusFailed    FileStatus = "failed"    // 失败
	FileStatusDeleted   FileStatus = "deleted"   // 已删除
)

// 文件信息模型
type File struct {
	ID             uint        `json:"id" gorm:"primaryKey"`
	UserID         uint        `json:"userId" gorm:"column:user_id;not null;index"`
	FileName       string      `json:"fileName" gorm:"column:file_name;not null"`
	OriginalName   string      `json:"originalName" gorm:"column:original_name;not null"`
	FilePath       string      `json:"filePath" gorm:"column:file_path;not null"`
	FileSize       int64       `json:"fileSize" gorm:"column:file_size;not null"`
	MimeType       string      `json:"mimeType" gorm:"column:mime_type"`
	StorageType    StorageType `json:"storageType" gorm:"column:storage_type;default:'local'"`
	Status         FileStatus  `json:"status" gorm:"default:'uploading'"`
	ParentID       *uint       `json:"parentId" gorm:"column:parent_id;index"` // 父文件夹ID，nil表示根目录
	IsFolder       bool        `json:"isFolder" gorm:"column:is_folder;default:false"`
	Hash           string      `json:"hash"`                                         // 文件MD5哈希，用于去重和断点续传
	ChunkCount     int         `json:"chunkCount" gorm:"column:chunk_count"`         // 分片数量
	UploadedChunks string      `json:"uploadedChunks" gorm:"column:uploaded_chunks"` // 已上传的分片，JSON格式存储
	CreatedAt      time.Time   `json:"createdAt"`
	UpdatedAt      time.Time   `json:"updatedAt"`
	DeletedAt      *time.Time  `json:"deletedAt,omitempty" gorm:"index"`
}

// 文件上传请求
type FileUploadRequest struct {
	FileName    string      `json:"fileName" binding:"required"`
	FileSize    int64       `json:"fileSize" binding:"required"`
	MimeType    string      `json:"mimeType"`
	ParentID    *uint       `json:"parentId"`
	Hash        string      `json:"hash"`       // 文件MD5哈希
	ChunkCount  int         `json:"chunkCount"` // 分片数量
	StorageType StorageType `json:"storageType" binding:"required"`
}

// 分片上传请求
type ChunkUploadRequest struct {
	FileID     uint   `json:"fileId" binding:"required"`
	ChunkIndex int    `json:"chunkIndex" binding:"required"`
	ChunkData  string `json:"chunkData" binding:"required"` // Base64编码的分片数据
}

// 文件列表请求
type FileListRequest struct {
	ParentID  *uint  `form:"parentId"`
	Page      int    `form:"page,default=1"`
	PageSize  int    `form:"pageSize,default=20"`
	Keyword   string `form:"keyword"`
	SortBy    string `form:"sortBy,default=createdAt"`
	SortOrder string `form:"sortOrder,default=desc"`
}

// 文件列表响应
type FileListResponse struct {
	Files      []File `json:"files"`
	Total      int64  `json:"total"`
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	TotalPages int    `json:"totalPages"`
}

// 创建文件夹请求
type CreateFolderRequest struct {
	FolderName string `json:"folderName" binding:"required"`
	ParentID   *uint  `json:"parentId"`
}

// 文件重命名请求
type RenameFileRequest struct {
	FileID  uint   `json:"fileId" binding:"required"`
	NewName string `json:"newName" binding:"required"`
}

// 移动文件请求
type MoveFileRequest struct {
	FileID   uint  `json:"fileId" binding:"required"`
	ParentID *uint `json:"parentId"`
}

// SFTP配置
type SFTPConfig struct {
	Host     string `json:"host" binding:"required"`
	Port     int    `json:"port" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	BasePath string `json:"basePath"` // SFTP服务器上的基础路径
}

// 文件上传进度
type UploadProgress struct {
	FileID       uint       `json:"fileId"`
	FileName     string     `json:"fileName"`
	TotalSize    int64      `json:"totalSize"`
	UploadedSize int64      `json:"uploadedSize"`
	Progress     float64    `json:"progress"` // 0-100
	Status       FileStatus `json:"status"`
}
