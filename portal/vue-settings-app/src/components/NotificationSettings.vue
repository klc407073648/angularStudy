<template>
  <div class="settings-page">
    <h3>通知设置</h3>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="邮件通知">
        <el-switch v-model="form.emailNotification" />
        <span class="form-tip">启用邮件通知功能</span>
      </el-form-item>
      
      <el-form-item label="SMTP服务器" v-if="form.emailNotification">
        <el-input v-model="form.smtpServer" placeholder="smtp.example.com" />
      </el-form-item>
      
      <el-form-item label="SMTP端口" v-if="form.emailNotification">
        <el-input-number v-model="form.smtpPort" :min="1" :max="65535" />
      </el-form-item>
      
      <el-form-item label="发送邮箱" v-if="form.emailNotification">
        <el-input v-model="form.senderEmail" placeholder="noreply@example.com" />
      </el-form-item>
      
      <el-form-item label="短信通知">
        <el-switch v-model="form.smsNotification" />
        <span class="form-tip">启用短信通知功能</span>
      </el-form-item>
      
      <el-form-item label="短信服务商" v-if="form.smsNotification">
        <el-select v-model="form.smsProvider" placeholder="请选择短信服务商">
          <el-option label="阿里云短信" value="aliyun" />
          <el-option label="腾讯云短信" value="tencent" />
          <el-option label="华为云短信" value="huawei" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="系统通知">
        <el-checkbox-group v-model="form.systemNotifications">
          <el-checkbox label="login">登录通知</el-checkbox>
          <el-checkbox label="error">错误通知</el-checkbox>
          <el-checkbox label="warning">警告通知</el-checkbox>
          <el-checkbox label="info">信息通知</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <el-form-item label="通知频率">
        <el-radio-group v-model="form.notificationFrequency">
          <el-radio label="immediate">立即通知</el-radio>
          <el-radio label="hourly">每小时汇总</el-radio>
          <el-radio label="daily">每日汇总</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置</el-button>
        <el-button type="success" @click="testNotification">测试通知</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'NotificationSettings',
  setup() {
    const form = reactive({
      emailNotification: true,
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      senderEmail: 'noreply@example.com',
      smsNotification: false,
      smsProvider: 'aliyun',
      systemNotifications: ['login', 'error'],
      notificationFrequency: 'immediate'
    })
    
    const saveSettings = () => {
      ElMessage.success('通知设置保存成功！')
      console.log('保存的通知设置:', form)
    }
    
    const resetSettings = () => {
      Object.assign(form, {
        emailNotification: true,
        smtpServer: 'smtp.example.com',
        smtpPort: 587,
        senderEmail: 'noreply@example.com',
        smsNotification: false,
        smsProvider: 'aliyun',
        systemNotifications: ['login', 'error'],
        notificationFrequency: 'immediate'
      })
      ElMessage.info('设置已重置')
    }
    
    const testNotification = () => {
      ElMessageBox.confirm(
        '此操作将发送测试通知，是否继续？',
        '测试通知',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(() => {
        ElMessage.success('测试通知发送成功！')
      }).catch(() => {
        ElMessage.info('已取消测试')
      })
    }
    
    return {
      form,
      saveSettings,
      resetSettings,
      testNotification
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

