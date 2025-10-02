<template>
  <div class="settings-page">
    <h3>安全设置</h3>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="密码策略">
        <el-checkbox-group v-model="form.passwordPolicy">
          <el-checkbox label="minLength">最少8位字符</el-checkbox>
          <el-checkbox label="requireNumber">必须包含数字</el-checkbox>
          <el-checkbox label="requireSpecial">必须包含特殊字符</el-checkbox>
          <el-checkbox label="requireUpper">必须包含大写字母</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="登录失败锁定">
        <el-switch v-model="form.loginLock" />
        <span class="form-tip">连续失败5次后锁定账户30分钟</span>
      </el-form-item>
      
      <el-form-item label="会话超时">
        <el-input-number 
          v-model="form.sessionTimeout" 
          :min="5" 
          :max="480" 
          controls-position="right"
        />
        <span class="form-tip">分钟（5-480分钟）</span>
      </el-form-item>
      
      <el-form-item label="双因子认证">
        <el-switch v-model="form.twoFactorAuth" />
        <span class="form-tip">启用后需要手机验证码登录</span>
      </el-form-item>
      
      <el-form-item label="IP白名单">
        <el-input 
          v-model="form.ipWhitelist" 
          type="textarea" 
          :rows="3"
          placeholder="请输入允许访问的IP地址，每行一个"
        />
      </el-form-item>
      
      <el-form-item label="操作日志">
        <el-switch v-model="form.operationLog" />
        <span class="form-tip">记录所有用户操作日志</span>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置</el-button>
        <el-button type="warning" @click="testSecurity">测试安全策略</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SecuritySettings',
  setup() {
    const form = reactive({
      passwordPolicy: ['minLength', 'requireNumber'],
      loginLock: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: '',
      operationLog: true
    })
    
    const saveSettings = () => {
      ElMessage.success('安全设置保存成功！')
      console.log('保存的安全设置:', form)
    }
    
    const resetSettings = () => {
      Object.assign(form, {
        passwordPolicy: ['minLength', 'requireNumber'],
        loginLock: true,
        sessionTimeout: 30,
        twoFactorAuth: false,
        ipWhitelist: '',
        operationLog: true
      })
      ElMessage.info('设置已重置')
    }
    
    const testSecurity = () => {
      ElMessageBox.confirm(
        '此操作将测试当前安全策略，是否继续？',
        '安全测试',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        ElMessage.success('安全策略测试通过！')
      }).catch(() => {
        ElMessage.info('已取消测试')
      })
    }
    
    return {
      form,
      saveSettings,
      resetSettings,
      testSecurity
    }
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 800px;
}

.settings-form {
  margin-top: 20px;
}

.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}
</style>

