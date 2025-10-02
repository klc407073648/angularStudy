<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="layout-header">
        <div class="header-content">
          <h2>系统设置</h2>
          <el-button 
            type="primary" 
            @click="goBack"
            v-if="showBackButton"
          >
            返回主应用
          </el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="layout-aside">
          <el-menu
            :default-active="activeMenu"
            class="settings-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="general">
              <el-icon><Setting /></el-icon>
              <span>基本设置</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="appearance">
              <el-icon><Brush /></el-icon>
              <span>外观设置</span>
            </el-menu-item>
            <el-menu-item index="advanced">
              <el-icon><Tools /></el-icon>
              <span>高级设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {  Setting, Lock, Bell, Brush, Tools } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Setting,
    Lock,
    Bell,
    Brush,
    Tools
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const activeMenu = computed(() => {
      return route.name || 'general'
    })
    
    const showBackButton = computed(() => {
      return window.__POWERED_BY_QIANKUN__
    })
    
    const handleMenuSelect = (index) => {
      console.log('Menu selected:', index)
      console.log('Current route:', route.path)
      console.log('Router available:', !!router)
      
      // 确保路由跳转正确
      const targetPath = `/${index}`
      console.log('Navigating to path:', targetPath)
      
      router.push(targetPath).then(() => {
        console.log('Router push successful to:', targetPath)
      }).catch(err => {
        console.error('Router push error:', err)
        // 如果路由跳转失败，尝试使用 replace
        router.replace(targetPath).catch(replaceErr => {
          console.error('Router replace also failed:', replaceErr)
        })
      })
    }
    
    const goBack = () => {
      if (window.__POWERED_BY_QIANKUN__) {
        // 在qiankun环境下，通过全局事件通知主应用
        window.parent.postMessage({ type: 'NAVIGATE_TO_MAIN' }, '*')
      } else {
        // 独立运行时，显示提示信息
        alert('这是Vue子应用的独立运行模式，返回功能仅在微前端环境下可用')
      }
    }
    
    return {
      activeMenu,
      showBackButton,
      handleMenuSelect,
      goBack
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}

.layout-container {
  height: 100vh;
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content h2 {
  margin: 0;
  color: #1890ff;
}

.layout-aside {
  background-color: #f5f5f5;
  border-right: 1px solid #e6e6e6;
}

.settings-menu {
  border-right: none;
}

.layout-main {
  background-color: #fff;
  padding: 20px;
}
</style>
