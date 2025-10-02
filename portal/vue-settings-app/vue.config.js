const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    historyApiFallback: true,
    // 允许外部访问
    host: '0.0.0.0',
    // 禁用主机检查
    allowedHosts: 'all'
  },
  configureWebpack: {
    output: {
      library: 'vue-settings-app',
      libraryTarget: 'umd',
      globalObject: 'window'
    }
  },
  css: {
    extract: false,  // 不提取CSS，确保样式在微前端环境下正确加载
    sourceMap: false
  }
})