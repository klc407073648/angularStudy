<template>
  <div class="settings-page">
    <h3>基本设置</h3>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="系统名称">
        <el-input v-model="form.systemName" placeholder="请输入系统名称" />
      </el-form-item>
      
      <el-form-item label="系统描述">
        <el-input 
          v-model="form.systemDescription" 
          type="textarea" 
          :rows="3"
          placeholder="请输入系统描述"
        />
      </el-form-item>
      
      <el-form-item label="管理员邮箱">
        <el-input v-model="form.adminEmail" placeholder="请输入管理员邮箱" />
      </el-form-item>
      
      <el-form-item label="系统时区">
        <el-select v-model="form.timezone" placeholder="请选择时区">
          <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
          <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
          <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
          <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="语言设置">
        <el-radio-group v-model="form.language">
          <el-radio label="zh-CN">简体中文</el-radio>
          <el-radio label="en-US">English</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="自动保存">
        <el-switch v-model="form.autoSave" />
        <span class="form-tip">开启后系统将自动保存您的设置</span>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'GeneralSettings',
  setup() {
    const form = reactive({
      systemName: 'Portal管理系统',
      systemDescription: '基于Angular和Vue的微前端管理系统',
      adminEmail: 'admin@example.com',
      timezone: 'Asia/Shanghai',
      language: 'zh-CN',
      autoSave: true
    })
    
    const saveSettings = () => {
      // 模拟保存操作
      ElMessage.success('基本设置保存成功！')
      console.log('保存的设置:', form)
    }
    
    const resetSettings = () => {
      Object.assign(form, {
        systemName: 'Portal管理系统',
        systemDescription: '基于Angular和Vue的微前端管理系统',
        adminEmail: 'admin@example.com',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        autoSave: true
      })
      ElMessage.info('设置已重置')
    }
    
    return {
      form,
      saveSettings,
      resetSettings
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

