import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/obsidian-i18n-edit/",
  build: {
    outDir: "docs"
  },
  plugins: [vue()],
})
