import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        profile: resolve(__dirname, 'profile.html'),
        apiary: resolve(__dirname, 'apiary.html'),
        hive: resolve(__dirname, 'hive.html'),
        analytics: resolve(__dirname, 'analytics.html'),
        admin: resolve(__dirname, 'admin.html'),
        notfound: resolve(__dirname, '404.html')
      }
    }
  }
});