// frontend/src/main.ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import 'vue-sonner/style.css'

const app = createApp(App)

// Global configuration for TanStack Query
const vueQueryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
        refetchOnWindowFocus: false, // Don't refetch every time the Electron window is clicked
        retry: 1, // Only retry failed requests once to avoid hanging
      },
    },
  },
}

app.use(router)
app.use(VueQueryPlugin, vueQueryOptions)

app.mount('#app')