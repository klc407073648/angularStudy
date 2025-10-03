package services

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"go-auth-server/models"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type SFTPService struct {
	config *models.SFTPConfig
}

func NewSFTPService(config *models.SFTPConfig) *SFTPService {
	return &SFTPService{config: config}
}

// 创建SFTP连接
func (s *SFTPService) createConnection() (*sftp.Client, error) {
	// SSH客户端配置
	sshConfig := &ssh.ClientConfig{
		User: s.config.Username,
		Auth: []ssh.AuthMethod{
			ssh.Password(s.config.Password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // 生产环境中应该验证主机密钥
		Timeout:         30 * time.Second,
	}

	// 连接到SSH服务器
	sshClient, err := ssh.Dial("tcp", fmt.Sprintf("%s:%d", s.config.Host, s.config.Port), sshConfig)
	if err != nil {
		return nil, fmt.Errorf("SSH连接失败: %v", err)
	}

	// 创建SFTP客户端
	sftpClient, err := sftp.NewClient(sshClient)
	if err != nil {
		sshClient.Close()
		return nil, fmt.Errorf("SFTP客户端创建失败: %v", err)
	}

	return sftpClient, nil
}

// 保存分片到SFTP
func (s *SFTPService) SaveChunk(file models.File, chunkIndex int, data []byte) error {
	sftpClient, err := s.createConnection()
	if err != nil {
		return err
	}
	defer sftpClient.Close()

	// 创建分片目录
	chunkDir := filepath.Join(s.config.BasePath, "chunks", fmt.Sprintf("%d", file.ID))
	if err := s.createRemoteDirectory(sftpClient, chunkDir); err != nil {
		return fmt.Errorf("创建分片目录失败: %v", err)
	}

	// 保存分片文件
	chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", chunkIndex))
	remoteFile, err := sftpClient.Create(chunkPath)
	if err != nil {
		return fmt.Errorf("创建分片文件失败: %v", err)
	}
	defer remoteFile.Close()

	_, err = remoteFile.Write(data)
	if err != nil {
		return fmt.Errorf("写入分片数据失败: %v", err)
	}

	return nil
}

// 合并SFTP分片
func (s *SFTPService) MergeChunks(file *models.File) error {
	sftpClient, err := s.createConnection()
	if err != nil {
		return err
	}
	defer sftpClient.Close()

	// 确保目标目录存在
	targetDir := filepath.Dir(file.FilePath)
	if err := s.createRemoteDirectory(sftpClient, targetDir); err != nil {
		return fmt.Errorf("创建目标目录失败: %v", err)
	}

	// 创建目标文件
	remoteFile, err := sftpClient.Create(file.FilePath)
	if err != nil {
		return fmt.Errorf("创建目标文件失败: %v", err)
	}
	defer remoteFile.Close()

	// 按顺序合并分片
	chunkDir := filepath.Join(s.config.BasePath, "chunks", fmt.Sprintf("%d", file.ID))
	for i := 0; i < file.ChunkCount; i++ {
		chunkPath := filepath.Join(chunkDir, fmt.Sprintf("chunk_%d", i))
		chunkFile, err := sftpClient.Open(chunkPath)
		if err != nil {
			return fmt.Errorf("打开分片 %d 失败: %v", i, err)
		}

		_, err = io.Copy(remoteFile, chunkFile)
		chunkFile.Close()
		if err != nil {
			return fmt.Errorf("复制分片 %d 失败: %v", i, err)
		}
	}

	// 清理分片文件
	s.cleanupChunks(sftpClient, chunkDir)

	return nil
}

// 下载文件
func (s *SFTPService) DownloadFile(file models.File, localPath string) error {
	sftpClient, err := s.createConnection()
	if err != nil {
		return err
	}
	defer sftpClient.Close()

	// 打开远程文件
	remoteFile, err := sftpClient.Open(file.FilePath)
	if err != nil {
		return fmt.Errorf("打开远程文件失败: %v", err)
	}
	defer remoteFile.Close()

	// 创建本地文件
	localFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("创建本地文件失败: %v", err)
	}
	defer localFile.Close()

	// 复制文件内容
	_, err = io.Copy(localFile, remoteFile)
	if err != nil {
		return fmt.Errorf("下载文件失败: %v", err)
	}

	return nil
}

// 删除文件
func (s *SFTPService) DeleteFile(file models.File) error {
	sftpClient, err := s.createConnection()
	if err != nil {
		return err
	}
	defer sftpClient.Close()

	// 删除文件
	err = sftpClient.Remove(file.FilePath)
	if err != nil {
		return fmt.Errorf("删除文件失败: %v", err)
	}

	// 尝试删除空目录
	dir := filepath.Dir(file.FilePath)
	s.cleanupEmptyDirectories(sftpClient, dir)

	return nil
}

// 创建远程目录
func (s *SFTPService) createRemoteDirectory(sftpClient *sftp.Client, dirPath string) error {
	// 检查目录是否已存在
	if _, err := sftpClient.Stat(dirPath); err == nil {
		return nil // 目录已存在
	}

	// 创建父目录
	parentDir := filepath.Dir(dirPath)
	if parentDir != "." && parentDir != "/" {
		if err := s.createRemoteDirectory(sftpClient, parentDir); err != nil {
			return err
		}
	}

	// 创建当前目录
	return sftpClient.Mkdir(dirPath)
}

// 清理分片文件
func (s *SFTPService) cleanupChunks(sftpClient *sftp.Client, chunkDir string) {
	// 列出分片目录中的所有文件
	files, err := sftpClient.ReadDir(chunkDir)
	if err != nil {
		return
	}

	// 删除所有分片文件
	for _, file := range files {
		if !file.IsDir() {
			sftpClient.Remove(filepath.Join(chunkDir, file.Name()))
		}
	}

	// 删除分片目录
	sftpClient.Rmdir(chunkDir)
}

// 清理空目录
func (s *SFTPService) cleanupEmptyDirectories(sftpClient *sftp.Client, dirPath string) {
	// 检查目录是否为空
	files, err := sftpClient.ReadDir(dirPath)
	if err != nil || len(files) > 0 {
		return
	}

	// 删除空目录
	sftpClient.Rmdir(dirPath)

	// 递归清理父目录
	parentDir := filepath.Dir(dirPath)
	if parentDir != "." && parentDir != "/" && parentDir != s.config.BasePath {
		s.cleanupEmptyDirectories(sftpClient, parentDir)
	}
}

// 检查SFTP连接
func (s *SFTPService) TestConnection() error {
	sftpClient, err := s.createConnection()
	if err != nil {
		return err
	}
	defer sftpClient.Close()

	// 尝试列出根目录
	_, err = sftpClient.ReadDir(s.config.BasePath)
	if err != nil {
		return fmt.Errorf("无法访问基础路径: %v", err)
	}

	return nil
}

// 获取文件信息
func (s *SFTPService) GetFileInfo(file models.File) (os.FileInfo, error) {
	sftpClient, err := s.createConnection()
	if err != nil {
		return nil, err
	}
	defer sftpClient.Close()

	return sftpClient.Stat(file.FilePath)
}

// 列出目录内容
func (s *SFTPService) ListDirectory(path string) ([]os.FileInfo, error) {
	sftpClient, err := s.createConnection()
	if err != nil {
		return nil, err
	}
	defer sftpClient.Close()

	return sftpClient.ReadDir(path)
}
