<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import csuLogo from '@/assets/csulogo.png';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
} from "lucide-vue-next"
import NavMain from "@/components/NavMain.vue"
import NavUser from "@/components/NavUser.vue"
import { useAuth } from "@/composables/useAuth" // Import useAuth

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const { user } = useAuth() // Access the reactive user state

// Updated Data Mapping
const data = {
  // Compute user data dynamically; fallback to defaults if not loaded
  user: {
    name: user.value?.name || "Guest",
    email: user.value?.email || "guest@csu.edu.ph",
    avatar: user.value?.avatar || "/csulogo.png", 
  },
  navMain: [
    {
      title: "System Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/dashboard" }
      ],
    },
    {
      title: "Inventory Management",
      url: "/inventory",
      icon: Package,
      items: [
        { title: "All Items", url: "/inventory" },
      ],
    },
    {
      title: "Transactions",
      url: "/stockout",
      icon: ClipboardList,
      items: [
        { title: "Record Stock-Out", url: "/stockout?action=record" },
        // { title: "Transaction History", url: "/stockout" },
      ],
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default hover:bg-transparent">
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent">
              <img :src="csuLogo" alt="CSU Logo" class="w-16 h-16" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold text-base">CSU-MIMS</span>
              <span class="truncate text-xs text-muted-foreground">TVET Massage Inventory</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    
    <SidebarRail />
  </Sidebar>
</template>