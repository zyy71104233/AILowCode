import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // 添加Markdown处理插件
    {
      name: 'markdown-loader',
      transform(code, id) {
        if (id.endsWith('.md')) {
          // 将Markdown转换为导出的字符串
          return `export default ${JSON.stringify(code)}`;
        }
      }
    }
  ],
  
  // 静态资源处理
  assetsInclude: ['**/*.md'],
  
  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@prompts': path.resolve(__dirname, './src/prompts')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096 // 4KB的资源内联阈值
  }
});