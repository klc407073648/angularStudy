import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

let instance = null

function render(props = {}) {
  const { container } = props
  console.log('[vue-settings-app] render called with props:', props)
  
  // 如果已有实例，先卸载
  if (instance) {
    instance.unmount()
    instance = null
  }
  
  instance = createApp(App)
  
  // 注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    instance.component(key, component)
  }
  
  instance.use(router)
  instance.use(ElementPlus)
  
  // 挂载应用
  let mountElement
  if (container) {
    // 微前端环境，挂载到指定的容器
    mountElement = container.querySelector('#app') || container
  } else {
    // 独立运行环境
    mountElement = '#app'
  }
  
  console.log('[vue-settings-app] Mounting to:', mountElement)
  instance.mount(mountElement)
  
  // 如果是微前端环境，处理路由初始化
  if (window.__POWERED_BY_QIANKUN__) {
    console.log('[vue-settings-app] Running in qiankun environment')
    
    // 等待路由准备就绪
    router.isReady().then(() => {
      console.log('[vue-settings-app] Router is ready')
      
      // 默认跳转到 general 页面
      if (router.currentRoute.value.path === '/') {
        router.push('/general').catch(err => {
          console.error('[vue-settings-app] Default navigation failed:', err)
        })
      }
    }).catch(err => {
      console.error('[vue-settings-app] Router ready failed:', err)
    })
  }
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('[vue-settings-app] vue app bootstraped')
}

export async function mount(props) {
  console.log('[vue-settings-app] props from main framework', props)
  render(props)
}

export async function unmount() {
  console.log('[vue-settings-app] unmount called')
  if (instance) {
    instance.unmount()
    instance = null
  }
}