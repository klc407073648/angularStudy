package config

import (
	"fmt"
	"os"
	"strconv"

	"go-auth-server/models"
)

// SFTP配置结构
type SFTPConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	BasePath string `json:"basePath"`
}

// 从环境变量加载SFTP配置
func LoadSFTPConfig() *models.SFTPConfig {
	config := &models.SFTPConfig{
		Host:     getEnv("SFTP_HOST", "localhost"),
		Port:     getEnvAsInt("SFTP_PORT", 22),
		Username: getEnv("SFTP_USERNAME", "sftp_user"),
		Password: getEnv("SFTP_PASSWORD", "sftp_password"),
		BasePath: getEnv("SFTP_BASE_PATH", "/uploads"),
	}

	return config
}

// 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// 获取环境变量并转换为整数，如果不存在或转换失败则返回默认值
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// 验证SFTP配置
func ValidateSFTPConfig(config *models.SFTPConfig) error {
	if config.Host == "" {
		return fmt.Errorf("SFTP主机地址不能为空")
	}
	if config.Port <= 0 || config.Port > 65535 {
		return fmt.Errorf("SFTP端口必须在1-65535之间")
	}
	if config.Username == "" {
		return fmt.Errorf("SFTP用户名不能为空")
	}
	if config.Password == "" {
		return fmt.Errorf("SFTP密码不能为空")
	}
	if config.BasePath == "" {
		return fmt.Errorf("SFTP基础路径不能为空")
	}
	return nil
}
