<script setup lang="ts">
import { ref } from "vue"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/composables/useAuth"
import { toast } from "vue-sonner" // 👈 1. Import toast

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const username = ref('')
const password = ref('')

const { login, isLoading, error } = useAuth()

const handleLogin = async () => {
  try {
    await login({ 
      username: username.value, 
      password: password.value 
    })
    toast.success("Successfully logged in!") // 👈 2. Add success toast
  } catch (err) {
    toast.error(error.value || "Authentication failed.") // 👈 3. Add error toast
  }
}

const goToDjangoAdmin = () => {
  window.location.href = 'http://localhost:8000/admin/'
}
</script>

<template>
  <form @submit.prevent="handleLogin" :class="cn('flex flex-col gap-6', props.class)">
    <FieldGroup>
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">
          CSU-MIMS Login
        </h1>
        <p class="text-muted-foreground text-sm text-balance">
          Enter your username below to login to your account
        </p>
      </div>

      <div v-if="error" class="text-sm font-medium text-destructive text-center">
        {{ error }}
      </div>
      
      <Field>
        <FieldLabel for="username">
          Username
        </FieldLabel>
        <Input 
          v-model="username" 
          id="username" 
          type="text" 
          placeholder="admin" 
          required 
          autocomplete="username" 
        />
      </Field>

      <Field>
        <FieldLabel for="password">
          Password
        </FieldLabel>
        <Input v-model="password" id="password" type="password" required autocomplete="current-password" />
      </Field>

      <Field>
        <Button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Authenticating...' : 'Login' }}
        </Button>
      </Field>

      <FieldSeparator>System Management</FieldSeparator>

      <Field>
        <Button variant="outline" type="button" @click="goToDjangoAdmin">
          Continue to Super Admin Interface
        </Button>
      </Field>
    </FieldGroup>
  </form>
</template>