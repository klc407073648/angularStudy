<template>
  <div class="settings-page">
    <h3>高级设置</h3>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="调试模式">
        <el-switch v-model="form.debugMode" />
        <span class="form-tip">启用调试模式</span>
      </el-form-item>
      
      <el-form-item label="API超时">
        <el-input-number v-model="form.apiTimeout" :min="1000" :max="30000" />
        <span class="form-tip">毫秒</span>
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
  name: 'AdvancedSettings',
  setup() {
    const form = reactive({
      debugMode: false,
      apiTimeout: 5000
    })
    
    const saveSettings = () => {
      ElMessage.success('高级设置保存成功！')
    }
    
    const resetSettings = () => {
      Object.assign(form, {
        debugMode: false,
        apiTimeout: 5000
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

