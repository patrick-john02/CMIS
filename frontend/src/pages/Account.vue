<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Note: In a fully complete app, you would fetch these details from a DRF endpoint
// like `/api/users/me/` using your apiClient. For now, we stub the state.
const userProfile = ref({
  username: 'Loading...',
  email: 'Loading...',
  role: 'Administrator'
})

onMounted(async () => {
  // TODO: Replace with actual API call to fetch user details
  // const response = await apiClient.get('/users/me/');
  // userProfile.value = response.data;
  
  // Simulating API load
  setTimeout(() => {
    userProfile.value = {
      username: 'CSU Admin',
      email: 'admin@csu.edu.ph',
      role: 'Administrator'
    }
  }, 500)
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Account Settings</h1>
    
    <div class="max-w-2xl bg-white border rounded-lg shadow-sm p-6">
      <div class="flex items-center space-x-4 mb-6">
        <div class="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
          {{ userProfile.username.substring(0, 2).toUpperCase() }}
        </div>
        <div>
          <h2 class="text-xl font-semibold">{{ userProfile.username }}</h2>
          <p class="text-gray-500">{{ userProfile.role }}</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              disabled 
              :value="userProfile.username"
              class="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              disabled 
              :value="userProfile.email"
              class="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>