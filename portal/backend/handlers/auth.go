package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"go-auth-server/models"
	"go-auth-server/services"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// 用户登录
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误",
			Code:    400,
		})
		return
	}

	loginResp, err := h.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    401,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "登录成功",
		Data:    loginResp,
		Code:    200,
	})
}

// 获取当前用户信息
func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: "未授权",
			Code:    401,
		})
		return
	}

	userInfo, err := h.authService.GetUserInfo(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiResponse{
			Success: false,
			Message: "获取用户信息失败",
			Code:    500,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "获取成功",
		Data:    userInfo,
		Code:    200,
	})
}

// 刷新令牌
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误",
			Code:    400,
		})
		return
	}

	refreshResp, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ApiResponse{
			Success: false,
			Message: err.Error(),
			Code:    401,
		})
		return
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "令牌刷新成功",
		Data:    refreshResp,
		Code:    200,
	})
}

// 用户登出
func (h *AuthHandler) Logout(c *gin.Context) {
	// 这里可以实现令牌黑名单机制
	c.JSON(http.StatusOK, models.ApiResponse{
		Success: true,
		Message: "登出成功",
		Code:    200,
	})
}

// 用户注册
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiResponse{
			Success: false,
			Message: "请求参数错误",
			Code:    400,
		})
		return
	}

	registerResp, err := h.authService.Register(&req)
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
		Message: "注册成功",
		Data:    registerResp,
		Code:    200,
	})
}
