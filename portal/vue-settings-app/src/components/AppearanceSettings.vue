<template>
  <div class="settings-page">
    <h3>外观设置</h3>
    <el-form :model="form" label-width="120px" class="settings-form">
      <el-form-item label="主题模式">
        <el-radio-group v-model="form.themeMode" @change="handleThemeChange">
          <el-radio label="light">浅色模式</el-radio>
          <el-radio label="dark">深色模式</el-radio>
          <el-radio label="auto">跟随系统</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="主色调">
        <el-color-picker v-model="form.primaryColor" @change="handleColorChange" />
        <span class="form-tip">选择系统主色调</span>
      </el-form-item>
      
      <el-form-item label="字体大小">
        <el-slider 
          v-model="form.fontSize" 
          :min="12" 
          :max="18" 
          :step="1"
          show-stops
          @change="handleFontSizeChange"
        />
        <span class="form-tip">{{ form.fontSize }}px</span>
      </el-form-item>
      
      <el-form-item label="布局密度">
        <el-radio-group v-model="form.layoutDensity">
          <el-radio label="compact">紧凑</el-radio>
          <el-radio label="default">默认</el-radio>
          <el-radio label="comfortable">宽松</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="侧边栏">
        <el-switch v-model="form.sidebarCollapsed" />
        <span class="form-tip">默认收起侧边栏</span>
      </el-form-item>
      
      <el-form-item label="面包屑导航">
        <el-switch v-model="form.breadcrumb" />
        <span class="form-tip">显示页面面包屑导航</span>
      </el-form-item>
      
      <el-form-item label="页面动画">
        <el-switch v-model="form.pageAnimation" />
        <span class="form-tip">启用页面切换动画</span>
      </el-form-item>
      
      <el-form-item label="自定义CSS">
        <el-input 
          v-model="form.customCSS" 
          type="textarea" 
          :rows="4"
          placeholder="输入自定义CSS样式"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
        <el-button @click="resetSettings">重置</el-button>
        <el-button type="info" @click="previewTheme">预览主题</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'AppearanceSettings',
  setup() {
    const form = reactive({
      themeMode: 'light',
      primaryColor: '#409EFF',
      fontSize: 14,
      layoutDensity: 'default',
      sidebarCollapsed: false,
      breadcrumb: true,
      pageAnimation: true,
      customCSS: ''
    })
    
    const handleThemeChange = (value) => {
      document.documentElement.setAttribute('data-theme', value)
      ElMessage.success(`已切换到${value === 'light' ? '浅色' : value === 'dark' ? '深色' : '自动'}模式`)
    }
    
    const handleColorChange = (value) => {
      document.documentElement.style.setProperty('--el-color-primary', value)
      ElMessage.success('主色调已更新')
    }
    
    const handleFontSizeChange = (value) => {
      document.documentElement.style.setProperty('--el-font-size-base', `${value}px`)
    }
    
    const saveSettings = () => {
      ElMessage.success('外观设置保存成功！')
      console.log('保存的外观设置:', form)
    }
    
    const resetSettings = () => {
      Object.assign(form, {
        themeMode: 'light',
        primaryColor: '#409EFF',
        fontSize: 14,
        layoutDensity: 'default',
        sidebarCollapsed: false,
        breadcrumb: true,
        pageAnimation: true,
        customCSS: ''
      })
      ElMessage.info('设置已重置')
    }
    
    const previewTheme = () => {
      ElMessage.info('主题预览功能开发中...')
    }
    
    return {
      form,
      handleThemeChange,
      handleColorChange,
      handleFontSizeChange,
      saveSettings,
      resetSettings,
      previewTheme
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

