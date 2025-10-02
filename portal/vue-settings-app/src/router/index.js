import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import GeneralSettings from '../components/GeneralSettings.vue'
import SecuritySettings from '../components/SecuritySettings.vue'
import NotificationSettings from '../components/NotificationSettings.vue'
import AppearanceSettings from '../components/AppearanceSettings.vue'
import AdvancedSettings from '../components/AdvancedSettings.vue'
import TestPage from '../components/TestPage.vue'
import SimpleTest from '../components/SimpleTest.vue'

const routes = [
  {
    path: '/',
    redirect: '/simple' // 默认重定向到简单测试页面
  },
  {
    path: '/simple',
    name: 'simple',
    component: SimpleTest
  },
  {
    path: '/test',
    name: 'test',
    component: TestPage
  },
  {
    path: '/general',
    name: 'general',
    component: GeneralSettings
  },
  {
    path: '/security',
    name: 'security',
    component: SecuritySettings
  },
  {
    path: '/notification',
    name: 'notification',
    component: NotificationSettings
  },
  {
    path: '/appearance',
    name: 'appearance',
    component: AppearanceSettings
  },
  {
    path: '/advanced',
    name: 'advanced',
    component: AdvancedSettings
  }
]

// 根据运行环境选择不同的路由模式
const router = createRouter({
  // 在微前端环境下使用内存路由，避免与主应用路由冲突
  history: window.__POWERED_BY_QIANKUN__ ? createMemoryHistory() : createWebHistory('/'),
  routes
})

// 在微前端环境下，动态修改根路径的重定向
if (window.__POWERED_BY_QIANKUN__) {
  // 移除默认的 /test 重定向，改为 /general
  const rootRoute = routes.find(route => route.path === '/')
  if (rootRoute) {
    rootRoute.redirect = '/general'
  }
}

// 在qiankun环境下处理路由
if (window.__POWERED_BY_QIANKUN__) {
  // 监听路由变化，同步到主应用
  router.beforeEach((to, from, next) => {
    console.log('Vue router navigation:', { from: from.path, to: to.path })
    
    // 如果是在微前端环境下，更新主应用的URL
    if (window.parent && window.parent !== window) {
      const newPath = `/vue-settings${to.path}`
      console.log('Sending route change message:', newPath)
      window.parent.postMessage({
        type: 'ROUTE_CHANGE',
        path: newPath
      }, '*')
    }
    
    next()
  })
  
  // 监听路由变化完成事件
  router.afterEach((to, from) => {
    console.log('Vue router navigation completed:', { from: from.path, to: to.path })
  })
}

export default router
