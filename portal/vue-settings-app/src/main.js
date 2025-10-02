import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

let instance = null

function render(props = {}) {
  const { container, data } = props
  instance = createApp(App)
  
  // 注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    instance.component(key, component)
  }
  
  instance.use(router)
  instance.use(ElementPlus)
  
  // 挂载应用
  const mountElement = container ? container.querySelector('#app') : '#app'
  instance.mount(mountElement)
  
  // 如果是微前端环境，处理路由初始化
  if (window.__POWERED_BY_QIANKUN__) {
    console.log('[vue-settings-app] Running in qiankun environment')
    console.log('[vue-settings-app] Props data:', data)
    
    // 等待路由准备就绪
    router.isReady().then(() => {
      console.log('[vue-settings-app] Router is ready')
      
      // 如果有传递的路径信息，则跳转到对应路由
      if (data && data.currentPath) {
        const vuePath = data.currentPath.replace('/vue-settings', '') || '/general'
        console.log('[vue-settings-app] Initializing with Vue path:', vuePath)
        
        // 确保路径以 / 开头
        const normalizedPath = vuePath.startsWith('/') ? vuePath : '/' + vuePath
        
        if (normalizedPath !== router.currentRoute.value.path) {
          router.push(normalizedPath).catch(err => {
            console.error('[vue-settings-app] Initial navigation failed:', err)
            // 如果导航失败，默认跳转到 general
            router.push('/general').catch(fallbackErr => {
              console.error('[vue-settings-app] Fallback navigation also failed:', fallbackErr)
            })
          })
        }
      } else {
        // 没有路径信息时，默认跳转到 general
        console.log('[vue-settings-app] No path data, defaulting to /general')
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
  if (instance) {
    instance.unmount()
    if (instance._container) {
      instance._container.innerHTML = ''
    }
    instance = null
  }
}