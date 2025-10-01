package services

import (
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"go-auth-server/models"
	"go-auth-server/utils"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	var user models.User

	// 查找用户
	if err := s.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, err
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	// 生成JWT令牌
	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}

	// 生成刷新令牌
	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	// 更新最后登录时间
	now := time.Now()
	user.LastLoginAt = &now
	s.db.Save(&user)

	return &models.LoginResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    24 * 60 * 60, // 24小时
	}, nil
}

func (s *AuthService) GetUserInfo(userID uint) (*models.UserInfoResponse, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, err
	}

	permissions := s.getUserPermissions(user.Role)

	return &models.UserInfoResponse{
		User:        user,
		Permissions: permissions,
	}, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*models.RefreshTokenResponse, error) {
	claims, err := utils.ParseToken(refreshToken)
	if err != nil {
		return nil, errors.New("无效的刷新令牌")
	}

	var user models.User
	if err := s.db.First(&user, claims.UserID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	// 生成新的访问令牌
	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}

	// 生成新的刷新令牌
	newRefreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.RefreshTokenResponse{
		Token:        token,
		RefreshToken: newRefreshToken,
		ExpiresIn:    24 * 60 * 60,
	}, nil
}

func (s *AuthService) getUserPermissions(role models.UserRole) []string {
	permissions := map[models.UserRole][]string{
		models.RoleAdmin: {"*"}, // 管理员拥有所有权限
		models.RoleUser:  {"manage.list.view", "welcome.view"},
	}

	if perms, exists := permissions[role]; exists {
		return perms
	}
	return []string{}
}

// 用户注册
func (s *AuthService) Register(req *models.RegisterRequest) (*models.RegisterResponse, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := s.db.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 加密密码
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 创建新用户
	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     models.RoleUser, // 默认为普通用户
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, errors.New("创建用户失败")
	}

	// 生成JWT令牌
	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role))
	if err != nil {
		return nil, err
	}

	// 生成刷新令牌
	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &models.RegisterResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    24 * 60 * 60, // 24小时
	}, nil
}

// 密码加密
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
