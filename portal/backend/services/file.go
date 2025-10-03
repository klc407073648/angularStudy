package services

import (
	"crypto/md5"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go-auth-server/config"
	"go-auth-server/models"

	"gorm.io/gorm"
)

type FileService struct {
	db *gorm.DB
}

func NewFileService(db *gorm.DB) *FileService {
	return &FileService{db: db}
}

// 创建文件记录
func (s *FileService) CreateFile(userID uint, req *models.FileUploadRequest) (*models.File, error) {
	// 检查文件名是否已存在
	var existingFile models.File
	query := s.db.Where("user_id = ? AND file_name = ? AND parent_id = ? AND deleted_at IS NULL",
		userID, req.FileName, req.ParentID)

	if err := query.First(&existingFile).Error; err == nil {
		return nil, fmt.Errorf("文件名已存在")
	}

	// 生成文件路径
	filePath := s.generateFilePath(userID, req.FileName, req.StorageType)

	file := &models.File{
		UserID:         userID,
		FileName:       req.FileName,
		OriginalName:   req.FileName,
		FilePath:       filePath,
		FileSize:       req.FileSize,
		MimeType:       req.MimeType,
		StorageType:    req.StorageType,
		Status:         models.FileStatusUploading,
		ParentID:       req.ParentID,
		IsFolder:       false,
		Hash:           req.Hash,
		ChunkCount:     req.ChunkCount,
		UploadedChunks: "[]", // 初始化为空数组
	}

	if err := s.db.Create(file).Error; err != nil {
		return nil, fmt.Errorf("创建文件记录失败: %v", err)
	}

	return file, nil
}

// 创建文件夹
func (s *FileService) CreateFolder(userID uint, req *models.CreateFolderRequest) (*models.File, error) {
	// 检查文件夹名是否已存在
	var existingFolder models.File
	query := s.db.Where("user_id = ? AND file_name = ? AND parent_id = ? AND is_folder = true AND deleted_at IS NULL",
		userID, req.FolderName, req.ParentID)

	if err := query.First(&existingFolder).Error; err == nil {
		return nil, fmt.Errorf("文件夹名已存在")
	}

	folder := &models.File{
		UserID:       userID,
		FileName:     req.FolderName,
		OriginalName: req.FolderName,
		FilePath:     "",
		FileSize:     0,
		MimeType:     "folder",
		StorageType:  models.StorageLocal,
		Status:       models.FileStatusCompleted,
		ParentID:     req.ParentID,
		IsFolder:     true,
	}

	if err := s.db.Create(folder).Error; err != nil {
		return nil, fmt.Errorf("创建文件夹失败: %v", err)
	}

	return folder, nil
}

// 上传文件分片
func (s *FileService) UploadChunk(fileID uint, chunkIndex int, chunkData string) error {
	var file models.File
	if err := s.db.First(&file, fileID).Error; err != nil {
		return fmt.Errorf("文件不存在")
	}

	// 解析已上传的分片
	var uploadedChunks []int
	if err := json.Unmarshal([]byte(file.UploadedChunks), &uploadedChunks); err != nil {
		uploadedChunks = []int{}
	}

	// 检查分片是否已上传
	for _, chunk := range uploadedChunks {
		if chunk == chunkIndex {
			return nil // 分片已存在，跳过
		}
	}

	// 解码分片数据
	data, err := base64.StdEncoding.DecodeString(chunkData)
	if err != nil {
		return fmt.Errorf("分片数据解码失败: %v", err)
	}

	// 根据存储类型保存分片
	switch file.StorageType {
	case models.StorageLocal:
		if err := s.saveChunkToLocal(file, chunkIndex, data); err != nil {
			return err
		}
	case models.StorageSFTP:
		if err := s.saveChunkToSFTP(file, chunkIndex, data); err != nil {
			return err
		}
	default:
		return fmt.Errorf("不支持的存储类型")
	}

	// 更新已上传分片列表
	uploadedChunks = append(uploadedChunks, chunkIndex)
	chunksJSON, _ := json.Marshal(uploadedChunks)

	// 更新文件记录
	updates := map[string]interface{}{
		"uploaded_chunks": string(chunksJSON),
	}

	// 如果所有分片都上传完成，合并文件
	if len(uploadedChunks) == file.ChunkCount {
		if err := s.mergeChunks(&file); err != nil {
			return fmt.Errorf("合并分片失败: %v", err)
		}
		updates["status"] = models.FileStatusCompleted
	}

	return s.db.Model(&file).Updates(updates).Error
}

// 保存分片到本地
func (s *FileService) saveChunkToLocal(file models.File, chunkIndex int, data []byte) error {
	chunkDir := filepath.Join("uploads", "chunks", fmt.Sprintf("%d", file.ID))
	if err := os.MkdirAll(chunkDir, 0755); err != nil {
		return fmt.Errorf("创建分片目录失败: %v", err)
	}

	chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", chunkIndex))
	return os.WriteFile(chunkPath, data, 0644)
}

// 保存分片到SFTP
func (s *FileService) saveChunkToSFTP(file models.File, chunkIndex int, data []byte) error {
	// 获取SFTP配置
	sftpConfig, err := s.getSFTPConfig()
	if err != nil {
		return fmt.Errorf("获取SFTP配置失败: %v", err)
	}

	sftpService := NewSFTPService(sftpConfig)
	return sftpService.SaveChunk(file, chunkIndex, data)
}

// 合并分片
func (s *FileService) mergeChunks(file *models.File) error {
	switch file.StorageType {
	case models.StorageLocal:
		return s.mergeLocalChunks(file)
	case models.StorageSFTP:
		return s.mergeSFTPChunks(file)
	default:
		return fmt.Errorf("不支持的存储类型")
	}
}

// 合并本地分片
func (s *FileService) mergeLocalChunks(file *models.File) error {
	// 确保目标目录存在
	targetDir := filepath.Dir(file.FilePath)
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("创建目标目录失败: %v", err)
	}

	// 创建目标文件
	targetFile, err := os.Create(file.FilePath)
	if err != nil {
		return fmt.Errorf("创建目标文件失败: %v", err)
	}
	defer targetFile.Close()

	// 按顺序合并分片
	chunkDir := filepath.Join("uploads", "chunks", fmt.Sprintf("%d", file.ID))
	for i := 0; i < file.ChunkCount; i++ {
		chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", i))
		chunkData, err := os.ReadFile(chunkPath)
		if err != nil {
			return fmt.Errorf("读取分片 %d 失败: %v", i, err)
		}

		if _, err := targetFile.Write(chunkData); err != nil {
			return fmt.Errorf("写入分片 %d 失败: %v", i, err)
		}
	}

	// 清理分片文件
	os.RemoveAll(chunkDir)

	return nil
}

// 合并SFTP分片
func (s *FileService) mergeSFTPChunks(file *models.File) error {
	// 获取SFTP配置
	sftpConfig, err := s.getSFTPConfig()
	if err != nil {
		return fmt.Errorf("获取SFTP配置失败: %v", err)
	}

	sftpService := NewSFTPService(sftpConfig)
	return sftpService.MergeChunks(file)
}

// 获取文件列表
func (s *FileService) GetFileList(userID uint, req *models.FileListRequest) (*models.FileListResponse, error) {
	var files []models.File
	var total int64

	query := s.db.Where("user_id = ? AND deleted_at IS NULL", userID)

	// 父目录过滤
	if req.ParentID != nil {
		query = query.Where("parent_id = ?", *req.ParentID)
	} else {
		query = query.Where("parent_id IS NULL")
	}

	// 关键词搜索
	if req.Keyword != "" {
		query = query.Where("file_name LIKE ?", "%"+req.Keyword+"%")
	}

	// 获取总数
	if err := query.Model(&models.File{}).Count(&total).Error; err != nil {
		return nil, fmt.Errorf("获取文件总数失败: %v", err)
	}

	// 排序
	orderBy := fmt.Sprintf("%s %s", req.SortBy, req.SortOrder)
	query = query.Order(orderBy)

	// 分页
	offset := (req.Page - 1) * req.PageSize
	if err := query.Offset(offset).Limit(req.PageSize).Find(&files).Error; err != nil {
		return nil, fmt.Errorf("获取文件列表失败: %v", err)
	}

	totalPages := int((total + int64(req.PageSize) - 1) / int64(req.PageSize))

	return &models.FileListResponse{
		Files:      files,
		Total:      total,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

// 删除文件
func (s *FileService) DeleteFile(userID uint, fileID uint) error {
	var file models.File
	if err := s.db.Where("id = ? AND user_id = ?", fileID, userID).First(&file).Error; err != nil {
		return fmt.Errorf("文件不存在")
	}

	// 软删除
	now := time.Now()
	return s.db.Model(&file).Update("deleted_at", now).Error
}

// 重命名文件
func (s *FileService) RenameFile(userID uint, req *models.RenameFileRequest) error {
	var file models.File
	if err := s.db.Where("id = ? AND user_id = ?", req.FileID, userID).First(&file).Error; err != nil {
		return fmt.Errorf("文件不存在")
	}

	// 检查新名称是否已存在
	var existingFile models.File
	query := s.db.Where("user_id = ? AND file_name = ? AND parent_id = ? AND id != ? AND deleted_at IS NULL",
		userID, req.NewName, file.ParentID, req.FileID)

	if err := query.First(&existingFile).Error; err == nil {
		return fmt.Errorf("文件名已存在")
	}

	// 更新文件名
	updates := map[string]interface{}{
		"file_name":     req.NewName,
		"original_name": req.NewName,
	}

	return s.db.Model(&file).Updates(updates).Error
}

// 移动文件
func (s *FileService) MoveFile(userID uint, req *models.MoveFileRequest) error {
	var file models.File
	if err := s.db.Where("id = ? AND user_id = ?", req.FileID, userID).First(&file).Error; err != nil {
		return fmt.Errorf("文件不存在")
	}

	// 检查目标位置是否已存在同名文件
	var existingFile models.File
	query := s.db.Where("user_id = ? AND file_name = ? AND parent_id = ? AND id != ? AND deleted_at IS NULL",
		userID, file.FileName, req.ParentID, req.FileID)

	if err := query.First(&existingFile).Error; err == nil {
		return fmt.Errorf("目标位置已存在同名文件")
	}

	// 更新父目录
	return s.db.Model(&file).Update("parent_id", req.ParentID).Error
}

// 生成文件路径
func (s *FileService) generateFilePath(userID uint, fileName string, storageType models.StorageType) string {
	timestamp := time.Now().Unix()
	hash := md5.Sum([]byte(fmt.Sprintf("%d_%s_%d", userID, fileName, timestamp)))
	hashStr := fmt.Sprintf("%x", hash)

	switch storageType {
	case models.StorageLocal:
		return filepath.Join("uploads", "files", fmt.Sprintf("%d", userID), hashStr[:2], hashStr[2:4], fileName)
	case models.StorageSFTP:
		return fmt.Sprintf("/uploads/%d/%s/%s/%s", userID, hashStr[:2], hashStr[2:4], fileName)
	default:
		return ""
	}
}

// 获取文件上传进度
func (s *FileService) GetUploadProgress(fileID uint) (*models.UploadProgress, error) {
	var file models.File
	if err := s.db.First(&file, fileID).Error; err != nil {
		return nil, fmt.Errorf("文件不存在")
	}

	var uploadedChunks []int
	json.Unmarshal([]byte(file.UploadedChunks), &uploadedChunks)

	uploadedSize := int64(len(uploadedChunks)) * (file.FileSize / int64(file.ChunkCount))
	progress := float64(len(uploadedChunks)) / float64(file.ChunkCount) * 100

	return &models.UploadProgress{
		FileID:       file.ID,
		FileName:     file.FileName,
		TotalSize:    file.FileSize,
		UploadedSize: uploadedSize,
		Progress:     progress,
		Status:       file.Status,
	}, nil
}

// 计算文件MD5哈希
func (s *FileService) CalculateFileHash(file multipart.File) (string, error) {
	hash := md5.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

// 验证文件类型
func (s *FileService) ValidateFileType(fileName string) error {
	ext := strings.ToLower(filepath.Ext(fileName))

	// 允许的文件类型
	allowedExts := []string{
		".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
		".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg",
		".mp4", ".avi", ".mov", ".wmv", ".flv",
		".mp3", ".wav", ".flac", ".aac",
		".zip", ".rar", ".7z", ".tar", ".gz",
	}

	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			return nil
		}
	}

	return fmt.Errorf("不支持的文件类型: %s", ext)
}

// 获取文件大小限制
func (s *FileService) GetFileSizeLimit() int64 {
	// 默认100MB
	return 100 * 1024 * 1024
}

// 获取分片大小
func (s *FileService) GetChunkSize() int64 {
	// 默认2MB
	return 2 * 1024 * 1024
}

// 获取SFTP配置
func (s *FileService) getSFTPConfig() (*models.SFTPConfig, error) {
	// 从环境变量加载SFTP配置
	sftpConfig := config.LoadSFTPConfig()

	// 验证配置
	if err := config.ValidateSFTPConfig(sftpConfig); err != nil {
		return nil, err
	}

	return sftpConfig, nil
}

// 测试SFTP连接
func (s *FileService) TestSFTPConnection() error {
	config, err := s.getSFTPConfig()
	if err != nil {
		return err
	}

	sftpService := NewSFTPService(config)
	return sftpService.TestConnection()
}
