import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'  // 添加 Pinia 导入

export function createApp() {
  const app = createSSRApp(App)

  // 创建并注册 Pinia
  const pinia = createPinia()
  app.use(pinia)

  return { app }
}
