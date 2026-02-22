<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  PackageOpen,
  Filter,
  Loader2
} from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'

// Import API Composables and Types
import { useItems } from '@/composables/useItems'
import type { AllocationType, Item } from '@/types/item'
import { toast } from 'vue-sonner'

const { 
  items, 
  isLoading, 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem: apiDeleteItem 
} = useItems()

// Fetch data on mount
onMounted(async () => {
  await fetchItems()
})

const searchQuery = ref('')
const filterAllocation = ref<string>('ALL')
const isSheetOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)

// Form state matching DRF Item model
const currentItem = ref({
  id: null as number | null,
  name: '',
  description: '',
  quantity: 0,
  unit: 'pcs',
  allocation_type: 'TRAINING' as AllocationType
})

// Filter logic applied to the reactive `items` from the backend
const filteredInventory = computed(() => {
  let result = items.value

  // Apply allocation filter
  if (filterAllocation.value !== 'ALL') {
    result = result.filter(item => item.allocation_type === filterAllocation.value)
  }

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    )
  }

  return result
})

// Hardcoded threshold to 10 for low stock indication since it's removed from DB
const getStatus = (quantity: number) => {
  if (quantity <= 0) return { label: 'Out of Stock', class: 'bg-destructive/10 text-destructive dark:bg-destructive/20' }
  if (quantity < 10) return { label: 'Low Stock', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
}

const getAllocationBadgeClass = (allocation: string) => {
  switch (allocation) {
    case 'TRAINING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'NC2': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  }
}

const openAddModal = () => {
  isEditing.value = false
  currentItem.value = { 
    id: null, 
    name: '', 
    description: '', 
    quantity: 0, 
    unit: 'pcs', 
    allocation_type: 'TRAINING' 
  }
  isSheetOpen.value = true
}

const openEditModal = (item: Item) => {
  isEditing.value = true
  currentItem.value = { 
    id: item.id,
    name: item.name,
    description: item.description || '',
    quantity: item.quantity,
    unit: item.unit,
    allocation_type: item.allocation_type
  }
  isSheetOpen.value = true
}

const saveItem = async () => {
  isSaving.value = true
  try {
    const payload = {
      name: currentItem.value.name,
      description: currentItem.value.description,
      quantity: currentItem.value.quantity,
      unit: currentItem.value.unit,
      allocation_type: currentItem.value.allocation_type
    }

    if (isEditing.value && currentItem.value.id !== null) {
      await updateItem(currentItem.value.id, payload)
      toast.success(`${payload.name} updated successfully!`)
    } else {
      await createItem(payload)
      toast.success(`${payload.name} added to inventory!`)
    }
    isSheetOpen.value = false
  } catch (error) {
    console.error("Failed to save item", error)
    toast.error("Failed to save item. Please check the details and try again.")
  } finally {
    isSaving.value = false
  }
}
const deleteItem = async (id: number) => {
  if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
    try {
      await apiDeleteItem(id)
      toast.success("Item deleted successfully.")
    } catch (error) {
      console.error("Failed to delete item", error)
      toast.error("An error occurred while deleting the item.")
    }
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p class="text-muted-foreground mt-1">
          Manage massage equipment, tools, and consumable supplies for CSU-MIMS.
        </p>
      </div>
      <Button @click="openAddModal" :disabled="isLoading">
        <Plus class="mr-2 h-4 w-4" />
        Add New Item
      </Button>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full max-w-sm">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="searchQuery"
          type="search" 
          placeholder="Search items..." 
          class="pl-8"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Filter class="h-4 w-4 text-muted-foreground" />
        <select 
          v-model="filterAllocation"
          class="flex h-9 w-full sm:w-50 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Allocations</option>
          <option value="TRAINING">Training Center</option>
          <option value="NC2">NC II Assessment</option>
        </select>
      </div>
    </div>

    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th scope="col" class="px-6 py-3 font-medium">Item Name</th>
              <th scope="col" class="px-6 py-3 font-medium">Description</th>
              <th scope="col" class="px-6 py-3 font-medium">Allocation</th>
              <th scope="col" class="px-6 py-3 font-medium">Quantity / Unit</th>
              <th scope="col" class="px-6 py-3 font-medium">Status</th>
              <th scope="col" class="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="isLoading && items.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <Loader2 class="h-8 w-8 mb-2 animate-spin opacity-50" />
                  <p>Loading inventory data...</p>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredInventory.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <PackageOpen class="h-10 w-10 mb-2 opacity-50" />
                  <p>No inventory items found.</p>
                </div>
              </td>
            </tr>
            <tr 
              v-else
              v-for="item in filteredInventory" 
              :key="item.id"
              class="hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 font-medium">{{ item.name }}</td>
              <td class="px-6 py-4 truncate max-w-50" :title="item.description || ''">
                {{ item.description || '-' }}
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2.5 py-1 rounded-md text-xs font-medium"
                  :class="getAllocationBadgeClass(item.allocation_type)"
                >
                  {{ item.allocation_type_display || item.allocation_type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="font-semibold">{{ item.quantity }}</span>
                <span class="text-muted-foreground ml-1">{{ item.unit }}</span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="getStatus(item.quantity).class"
                >
                  {{ getStatus(item.quantity).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8">
                      <MoreHorizontal class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditModal(item)">
                      <Edit class="mr-2 h-4 w-4" />
                      Edit Item
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      class="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      @click="deleteItem(item.id)"
                    >
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Sheet v-model:open="isSheetOpen">
      <SheetContent class="sm:max-w-md overflow-hidden flex flex-col p-0 gap-0">
        
        <div class="px-6 py-6 sm:px-8 border-b bg-background z-10 sticky top-0">
          <SheetHeader class="p-0">
            <SheetTitle class="text-2xl">{{ isEditing ? 'Edit Inventory Item' : 'Add New Item' }}</SheetTitle>
            <SheetDescription class="mt-1.5">
              {{ isEditing ? 'Update the details of the existing inventory item.' : 'Enter the details of the new item to add to the system.' }}
            </SheetDescription>
          </SheetHeader>
        </div>
        
        <form @submit.prevent="saveItem" class="flex flex-col h-full overflow-y-auto">
          <div class="flex-1 px-6 py-8 sm:px-8 flex flex-col gap-6">
            <Field>
              <FieldLabel for="name" class="font-semibold">Item Name</FieldLabel>
              <Input 
                id="name" 
                v-model="currentItem.name" 
                placeholder="e.g. Lavender Massage Oil" 
                required 
                class="bg-muted/40 hover:bg-muted/60 focus:bg-background transition-colors"
              />
            </Field>

            <Field>
              <FieldLabel for="description" class="font-semibold">
                Description <span class="text-muted-foreground font-normal ml-1">(Optional)</span>
              </FieldLabel>
              <Input 
                id="description" 
                v-model="currentItem.description" 
                placeholder="Brief details or category" 
                class="bg-muted/40 hover:bg-muted/60 focus:bg-background transition-colors"
              />
            </Field>

            <Field>
              <FieldLabel for="allocation" class="font-semibold">Designated Allocation</FieldLabel>
              <select 
                id="allocation" 
                v-model="currentItem.allocation_type"
                class="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-muted/40 hover:bg-muted/60 px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
                required
              >
                <option value="TRAINING">Training Center</option>
                <option value="NC2">NC II Assessment</option>
              </select>
            </Field>

            <div class="grid grid-cols-2 gap-5">
              <Field>
                <FieldLabel for="quantity" class="font-semibold">Quantity</FieldLabel>
                <Input 
                  id="quantity" 
                  type="number" 
                  v-model="currentItem.quantity" 
                  min="0" 
                  required 
                  class="bg-muted/40 hover:bg-muted/60 focus:bg-background transition-colors"
                />
              </Field>

              <Field>
                <FieldLabel for="unit" class="font-semibold">Unit Type</FieldLabel>
                <Input 
                  id="unit" 
                  v-model="currentItem.unit" 
                  placeholder="e.g. bottles, pcs" 
                  required 
                  class="bg-muted/40 hover:bg-muted/60 focus:bg-background transition-colors"
                />
              </Field>
            </div>
          </div>

          <div class="px-6 py-4 sm:px-8 border-t bg-muted/20 z-10 sticky bottom-0 mt-auto">
            <SheetFooter class="flex sm:justify-end gap-3 p-0">
              <Button type="button" variant="outline" @click="isSheetOpen = false" :disabled="isSaving" class="w-full sm:w-auto bg-background">
                Cancel
              </Button>
              <Button type="submit" :disabled="isSaving" class="w-full sm:w-auto">
                <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ isEditing ? 'Save Changes' : 'Create Item' }}
              </Button>
            </SheetFooter>
          </div>
        </form>

      </SheetContent>
    </Sheet>
  </div>
</template>