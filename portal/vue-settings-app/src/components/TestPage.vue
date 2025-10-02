<template>
  <div class="test-page">
    <h2>Vue子应用测试页面</h2>
    <p>如果您看到这个页面，说明Vue子应用已经成功加载！</p>
    <p>当前路径: {{ currentPath }}</p>
    
    <div style="margin: 20px 0;">
      <el-button type="primary" @click="goToGeneral">跳转到基本设置</el-button>
      <el-button type="success" @click="goToSecurity">跳转到安全设置</el-button>
      <el-button type="warning" @click="goToNotification">跳转到通知设置</el-button>
    </div>
    
    <div style="margin: 20px 0;">
      <h4>调试信息：</h4>
      <p>qiankun 环境: {{ isQiankun }}</p>
      <p>路由可用: {{ routerAvailable }}</p>
    </div>
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

export default {
  name: 'TestPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const currentPath = computed(() => route.path)
    const isQiankun = computed(() => !!window.__POWERED_BY_QIANKUN__)
    const routerAvailable = computed(() => !!router)
    
    const goToGeneral = () => {
      console.log('TestPage: Navigating to general')
      router.push('/general').catch(err => console.error('Navigation error:', err))
    }
    
    const goToSecurity = () => {
      console.log('TestPage: Navigating to security')
      router.push('/security').catch(err => console.error('Navigation error:', err))
    }
    
    const goToNotification = () => {
      console.log('TestPage: Navigating to notification')
      router.push('/notification').catch(err => console.error('Navigation error:', err))
    }
    
    return {
      currentPath,
      isQiankun,
      routerAvailable,
      goToGeneral,
      goToSecurity,
      goToNotification
    }
  }
}
</script>

<style scoped>
.test-page {
  text-align: center;
  padding: 50px;
}

.test-page h2 {
  color: #409EFF;
  margin-bottom: 20px;
}
</style>

