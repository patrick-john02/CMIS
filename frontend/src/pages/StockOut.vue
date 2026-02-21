<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, ClipboardList, Loader2, AlertCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'

// Composables for API integration
import { useStockOuts } from '@/composables/useStockOuts'
import { useItems } from '@/composables/useItems'

const { stockOuts, isLoading: stockOutsLoading, fetchStockOuts, createStockOut } = useStockOuts()
const { items, fetchItems } = useItems()

// Fetch required data from DRF on mount
onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchStockOuts()
  ])
})

const searchQuery = ref('')
const isSheetOpen = ref(false)
const isSaving = ref(false)

// Form state matching DRF StockOut transaction payload
const currentTransaction = ref({
  item: null as number | null,
  quantity_deducted: 1,
  remarks: ''
})

// Filter transactions locally
const filteredTransactions = computed(() => {
  if (!searchQuery.value) return stockOuts.value
  
  const query = searchQuery.value.toLowerCase()
  return stockOuts.value.filter(txn => 
    txn.item_name?.toLowerCase().includes(query) ||
    (txn.remarks && txn.remarks.toLowerCase().includes(query)) ||
    txn.released_by_name?.toLowerCase().includes(query)
  )
})


const openAddModal = () => {
  currentTransaction.value = {
    item: items.value.length > 0 ? items.value[0]?.id ?? null : null,
    quantity_deducted: 1,
    remarks: ''
  }
  isSheetOpen.value = true
}

const selectedItem = computed(() => {
  if (!currentTransaction.value.item) return null
  return items.value.find(i => i.id === currentTransaction.value.item) || null
})

const isQuantityValid = computed(() => {
  // 1. Assign to a local variable first
  const item = selectedItem.value;
  
  // 2. Do the null/undefined check on the local variable
  if (!item) return false;
  
  const qty = currentTransaction.value.quantity_deducted;
  
  // 3. TypeScript now knows 'item' is definitely defined here
  return qty > 0 && qty <= item.quantity;
})

const submitTransaction = async () => {
  // 1. Assign to a local variable first
  const item = selectedItem.value;
  
  if (!item) return;

  const qty = currentTransaction.value.quantity_deducted;
  

  if (qty <= 0 || qty > item.quantity) {
    toast.warning("Invalid quantity. Please check your stock levels.");
    return;
  }

  isSaving.value = true
  try {
    await createStockOut({
      item: currentTransaction.value.item as number,
      quantity_deducted: currentTransaction.value.quantity_deducted,
      remarks: currentTransaction.value.remarks || null
    })
    

    await fetchItems()
    isSheetOpen.value = false
    toast.success("Stock-out recorded successfully!") 
  } catch (error) {
    console.error("Failed to process transaction", error)
    toast.error("Failed to process transaction. Check your stock levels and try again.") 
  } finally {
    isSaving.value = false
  }
}


const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Stock-Out Logs</h1>
        <p class="text-muted-foreground mt-1">
          Monitor item releases for the Training Center and NC II Assessment.
        </p>
      </div>
      <Button @click="openAddModal" :disabled="stockOutsLoading || items.length === 0">
        <Plus class="mr-2 h-4 w-4" />
        New Release
      </Button>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full max-w-sm">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          v-model="searchQuery"
          type="search" 
          placeholder="Search by item, personnel, or remarks..." 
          class="pl-8"
        />
      </div>
    </div>

    <div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th scope="col" class="px-6 py-3 font-medium">Date & Time</th>
              <th scope="col" class="px-6 py-3 font-medium">Item Released</th>
              <th scope="col" class="px-6 py-3 font-medium">Quantity</th>
              <th scope="col" class="px-6 py-3 font-medium">Released By</th>
              <th scope="col" class="px-6 py-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="stockOutsLoading && stockOuts.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <Loader2 class="h-8 w-8 mb-2 animate-spin opacity-50" />
                  <p>Loading transactions...</p>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <ClipboardList class="h-10 w-10 mb-2 opacity-50" />
                  <p>No stock-out transactions found.</p>
                </div>
              </td>
            </tr>
            <tr 
              v-else
              v-for="txn in filteredTransactions" 
              :key="txn.id"
              class="hover:bg-muted/50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(txn.release_date) }}</td>
              <td class="px-6 py-4 font-medium">{{ txn.item_name }}</td>
              <td class="px-6 py-4">
                <span class="font-semibold text-destructive">-{{ txn.quantity_deducted }}</span>
                <span class="text-muted-foreground ml-1">{{ txn.item_unit }}</span>
              </td>
              <td class="px-6 py-4">{{ txn.released_by_name || 'System / Admin' }}</td>
              <td class="px-6 py-4 truncate max-w-50" :title="txn.remarks || ''">
                {{ txn.remarks || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Sheet v-model:open="isSheetOpen">
      <SheetContent class="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Item Release</SheetTitle>
          <SheetDescription>
            Select an item to deduct from inventory. This action will be logged and the quantity automatically adjusted.
          </SheetDescription>
        </SheetHeader>
        
        <form @submit.prevent="submitTransaction" class="flex flex-col gap-6 py-6 h-full">
          <Field>
            <FieldLabel for="item">Select Item</FieldLabel>
            <select 
              id="item" 
              v-model="currentTransaction.item"
              class="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option disabled value="">Choose an inventory item...</option>
              <option v-for="inventoryItem in items" :key="inventoryItem.id" :value="inventoryItem.id">
                {{ inventoryItem.name }} ({{ inventoryItem.allocation_type_display || inventoryItem.allocation_type }})
              </option>
            </select>
          </Field>

          <div v-if="selectedItem" class="rounded-md bg-muted/50 p-3 flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-blue-500 mt-0.5" />
            <div class="text-sm">
              <p class="font-medium">Current Available Stock</p>
              <p class="text-muted-foreground">
                <span class="font-bold text-foreground">{{ selectedItem.quantity }}</span> {{ selectedItem.unit }}
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel for="quantity">Quantity to Release</FieldLabel>
            <Input 
              id="quantity" 
              type="number" 
              v-model="currentTransaction.quantity_deducted" 
              :max="selectedItem?.quantity || 1"
              min="1" 
              required 
            />
            <p v-if="!isQuantityValid && selectedItem" class="text-xs text-destructive mt-1">
              Quantity cannot exceed current stock ({{ selectedItem.quantity }}).
            </p>
          </Field>

          <Field>
            <FieldLabel for="remarks">Remarks / Reason (Optional)</FieldLabel>
            <Input 
              id="remarks" 
              v-model="currentTransaction.remarks" 
              placeholder="e.g. For Monday morning NC II assessment..." 
            />
          </Field>

          <SheetFooter class="mt-auto pt-6">
            <Button type="button" variant="outline" @click="isSheetOpen = false" :disabled="isSaving">Cancel</Button>
            <Button type="submit" :disabled="isSaving || !isQuantityValid">
              <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
              Confirm Release
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  </div>
</template>