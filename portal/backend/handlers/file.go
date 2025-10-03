package handlers

import (
	"go-auth-server/models"
	"go-auth-server/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	fileService *services.FileService
}

func NewFileHandler(fileService *services.FileService) *FileHandler {
	return &FileHandler{fileService: fileService}
}

// 创建文件上传记录
func (h *FileHandler) CreateFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.FileUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	// 验证文件类型
	if err := h.fileService.ValidateFileType(req.FileName); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	// 验证文件大小
	if req.FileSize > h.fileService.GetFileSizeLimit() {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "文件大小超出限制",
			Code:    400,
		})
		return
	}

	file, err := h.fileService.CreateFile(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件创建成功",
		Data:    file,
		Code:    200,
	})
}

// 上传文件分片
func (h *FileHandler) UploadChunk(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.ChunkUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	err := h.fileService.UploadChunk(req.FileID, req.ChunkIndex, req.ChunkData)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "分片上传成功",
		Code:    200,
	})
}

// 获取文件列表
func (h *FileHandler) GetFileList(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.FileListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	fileList, err := h.fileService.GetFileList(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    500,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "获取成功",
		Data:    fileList,
		Code:    200,
	})
}

// 创建文件夹
func (h *FileHandler) CreateFolder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	folder, err := h.fileService.CreateFolder(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件夹创建成功",
		Data:    folder,
		Code:    200,
	})
}

// 删除文件
func (h *FileHandler) DeleteFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	fileIDStr := c.Param("id")
	fileID, err := strconv.ParseUint(fileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "无效的文件ID",
			Code:    400,
		})
		return
	}

	err = h.fileService.DeleteFile(userID.(uint), uint(fileID))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件删除成功",
		Code:    200,
	})
}

// 重命名文件
func (h *FileHandler) RenameFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.RenameFileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	err := h.fileService.RenameFile(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件重命名成功",
		Code:    200,
	})
}

// 移动文件
func (h *FileHandler) MoveFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	var req models.MoveFileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误: " + err.Error(),
			Code:    400,
		})
		return
	}

	err := h.fileService.MoveFile(userID.(uint), &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件移动成功",
		Code:    200,
	})
}

// 获取上传进度
func (h *FileHandler) GetUploadProgress(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	fileIDStr := c.Param("id")
	fileID, err := strconv.ParseUint(fileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "无效的文件ID",
			Code:    400,
		})
		return
	}

	progress, err := h.fileService.GetUploadProgress(uint(fileID))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "获取成功",
		Data:    progress,
		Code:    200,
	})
}

// 下载文件
func (h *FileHandler) DownloadFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	fileIDStr := c.Param("id")
	fileID, err := strconv.ParseUint(fileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "无效的文件ID",
			Code:    400,
		})
		return
	}

	// 这里需要实现文件下载逻辑
	// 根据存储类型从不同位置读取文件
	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "文件下载功能待实现",
		Code:    200,
	})
}

// 获取文件信息
func (h *FileHandler) GetFileInfo(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	fileIDStr := c.Param("id")
	fileID, err := strconv.ParseUint(fileIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "无效的文件ID",
			Code:    400,
		})
		return
	}

	// 这里需要实现获取文件信息的逻辑
	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "获取文件信息功能待实现",
		Code:    200,
	})
}

// 测试SFTP连接
func (h *FileHandler) TestSFTPConnection(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	// 验证用户权限（只有管理员可以测试SFTP连接）
	userRole, exists := c.Get("role")
	if !exists || userRole.(string) != string(models.RoleAdmin) {
		c.JSON(http.StatusForbidden, models.ApiResponse{
			Success: false,
			Message: "权限不足：只有管理员可以测试SFTP连接",
			Code:    403,
		})
		return
	}

	err := h.fileService.TestSFTPConnection()
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "SFTP连接测试失败: " + err.Error(),
			Code:    400,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "SFTP连接测试成功",
		Code:    200,
	})
}
