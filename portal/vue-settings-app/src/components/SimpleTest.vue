<template>
  <div class="simple-test">
    <h1>Vue 应用测试页面</h1>
    <p>如果您看到这个页面，说明 Vue 应用正在独立运行！</p>
    <p>当前时间: {{ currentTime }}</p>
    <p>qiankun 环境: {{ isQiankun ? '是' : '否' }}</p>
    
    <div style="margin: 20px 0;">
      <button @click="showAlert">点击测试</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'SimpleTest',
  setup() {
    const currentTime = ref('')
    const isQiankun = ref(false)
    
    onMounted(() => {
      currentTime.value = new Date().toLocaleString()
      isQiankun.value = !!window.__POWERED_BY_QIANKUN__
      console.log('SimpleTest mounted, qiankun:', isQiankun.value)
    })
    
    const showAlert = () => {
      alert('Vue 应用工作正常！')
    }
    
    return {
      currentTime,
      isQiankun,
      showAlert
    }
  }
}
</script>

<style scoped>
.simple-test {
  text-align: center;
  padding: 50px;
  font-family: Arial, sans-serif;
}

.simple-test h1 {
  color: #42b883;
  margin-bottom: 20px;
}

.simple-test p {
  margin: 10px 0;
  font-size: 16px;
}

button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #369870;
}
</style>
