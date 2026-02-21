<script lang="ts">
export const description = "CSU-MIMS Login Page with Split Branding and Glass Effect"
</script>

<script setup lang="ts">
import LoginForm from "@/components/LoginForm.vue"
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 p-6 md:p-10 bg-background">
      <div class="flex justify-center gap-2 md:justify-start">
        <a href="#" class="flex items-center gap-2 font-semibold">
          <div class="flex size-8 items-center justify-center rounded-md overflow-hidden bg-primary/10">
            <img 
              src="/csulogo.png" 
              alt="CSU Logo" 
              class="size-full object-contain p-1"
            />
          </div>
          <span class="text-xl tracking-tight">CSU-MIMS</span>
        </a>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
    </div>

    <div class="relative hidden lg:block overflow-hidden border-l">
      <img
        src="/campus.jpg"
        alt="CSU Campus"
        class="absolute inset-0 h-full w-full object-cover"
      />
      
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-12">
        <div 
          class="max-w-md p-10 rounded-3xl 
                 bg-white/10 backdrop-blur-xl 
                 border border-white/20 
                 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                 text-white"
        >
          <div class="space-y-4">
            <div class="inline-block p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 mb-2">
              <img src="/csulogo.png" alt="CSU Logo" class="size-12 object-contain" />
            </div>
            <h2 class="text-4xl font-bold tracking-tight">CSU Massage</h2>
            <div class="h-1 w-12 bg-white/50 rounded-full"></div>
            <p class="text-xl font-medium text-white/90">Inventory Management System</p>
            <p class="text-white/70 leading-relaxed text-sm">
              Supporting the Training Center and NC II Assessment programs with 
              precision tracking of massage equipment and therapy supplies.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>