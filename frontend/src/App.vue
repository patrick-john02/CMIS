<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar' // Import these
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
// Don't show the sidebar on the Login page
const isLoginPage = computed(() => route.name === 'Login')
</script>

<template>
  <SidebarProvider v-if="!isLoginPage">
    <div class="flex min-h-svh w-full">
      <AppSidebar />
      <SidebarInset>
        <main class="flex-1 p-6 overflow-y-auto">
          <router-view />
        </main>
      </SidebarInset>
    </div>
  </SidebarProvider>

  <main v-else class="min-h-svh">
    <router-view />
  </main>

  <Toaster position="top-right" richColors expand />
</template>