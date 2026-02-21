<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { 
  Package, 
  AlertTriangle, 
  ArrowDownRight, 
  ClipboardCheck,
  Activity
} from 'lucide-vue-next'

// Import your TS composables
import { useItems } from '@/composables/useItems'
import { useStockOuts } from '@/composables/useStockOuts'

// Destructure the state and fetch functions
const { items, fetchItems, isLoading: itemsLoading } = useItems()
const { stockOuts, fetchStockOuts, isLoading: stockOutsLoading } = useStockOuts()

// Fetch data from Django DRF when the page loads
onMounted(async () => {
  await Promise.all([
    fetchItems(),
    fetchStockOuts()
  ])
})

// Dynamically calculate stats using computed properties
const totalItems = computed(() => items.value.length)

// Alert if quantity drops below 10
const lowStockCount = computed(() => {
  return items.value.filter(item => item.quantity < 10).length
})

// FIX: Updated 'txn.item_id' to 'txn.item' to match the interface
const trainingStockOuts = computed(() => {
  return stockOuts.value.filter(txn => {
    const item = items.value.find(i => i.id === txn.item)
    return item?.allocation_type === 'TRAINING'
  }).length
})

// FIX: Updated 'txn.item_id' to 'txn.item'
const nc2StockOuts = computed(() => {
  return stockOuts.value.filter(txn => {
    const item = items.value.find(i => i.id === txn.item)
    return item?.allocation_type === 'NC2'
  }).length
})

// Map the computed values to your UI stats array
const stats = computed(() => [
  {
    title: 'Total Inventory Items',
    value: totalItems.value.toString(),
    description: 'Unique items registered',
    icon: Package,
    iconClass: 'text-blue-500'
  },
  {
    title: 'Low Stock Alerts',
    value: lowStockCount.value.toString(),
    description: 'Supplies needing restock (<10)',
    icon: AlertTriangle,
    iconClass: 'text-amber-500'
  },
  {
    title: 'Training Center Stock-Outs',
    value: trainingStockOuts.value.toString(),
    description: 'Total releases',
    icon: ArrowDownRight,
    iconClass: 'text-emerald-500'
  },
  {
    title: 'NC II Assessment Stock-Outs',
    value: nc2StockOuts.value.toString(),
    description: 'Total releases',
    icon: ClipboardCheck,
    iconClass: 'text-purple-500'
  }
])

// FIX: Updated mapping to use 'txn.item', 'txn.quantity_deducted', and 'txn.release_date'
const recentActivities = computed(() => {
  return stockOuts.value.slice(0, 5).map((txn, index) => {
    const relatedItem = items.value.find(i => i.id === txn.item)
    
    let categoryText = 'Inventory'
    if (relatedItem?.allocation_type === 'TRAINING') categoryText = 'Training Center'
    if (relatedItem?.allocation_type === 'NC2') categoryText = 'NC II Assessment'

    return {
      id: txn.id || index,
      action: 'Stock Out',
      item: relatedItem ? relatedItem.name : `Item #${txn.item}`,
      quantity: txn.quantity_deducted,
      category: categoryText,
      time: txn.release_date ? new Date(txn.release_date).toLocaleDateString() : 'Recently'
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground mt-1">
          Overview of CSU Massage equipment and therapy supplies.
        </p>
      </div>
    </div>

    <div v-if="itemsLoading || stockOutsLoading" class="text-sm text-muted-foreground animate-pulse">
      Syncing with database...
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in stats" 
        :key="stat.title"
        class="rounded-xl border bg-card text-card-foreground shadow-sm"
      >
        <div class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 class="tracking-tight text-sm font-medium">
            {{ stat.title }}
          </h3>
          <component :is="stat.icon" :class="['h-4 w-4', stat.iconClass]" />
        </div>
        <div class="p-6 pt-0">
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ stat.description }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-4 flex flex-col">
        <div class="p-6 flex flex-col space-y-1.5">
          <h3 class="font-semibold leading-none tracking-tight">Inventory Distribution</h3>
          <p class="text-sm text-muted-foreground">Training Center vs NC II Assessment trends over the last 30 days.</p>
        </div>
        <div class="p-6 pt-0 flex-1 flex items-center justify-center min-h-75 border-t border-dashed m-6 mt-0 bg-muted/20 rounded-lg">
          <div class="flex flex-col items-center text-muted-foreground">
            <Activity class="h-10 w-10 mb-2 opacity-50" />
            <span class="text-sm font-medium">Chart visualization will render here</span>
            <span class="text-xs">Requires Chart.js or Recharts integration</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-3 flex flex-col">
        <div class="p-6 flex flex-col space-y-1.5">
          <h3 class="font-semibold leading-none tracking-tight">Recent Activity</h3>
          <p class="text-sm text-muted-foreground">Latest system transactions.</p>
        </div>
        <div class="p-6 pt-0 flex-1">
          <div v-if="recentActivities.length === 0" class="text-sm text-muted-foreground text-center py-8">
            No recent transactions found.
          </div>
          <div class="space-y-6">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-center"
            >
              <div class="ml-4 space-y-1 flex-1">
                <p class="text-sm font-medium leading-none">
                  {{ activity.item }}
                </p>
                <div class="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                  <span 
                    class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                    :class="[
                      activity.category === 'Training Center' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                      activity.category === 'NC II Assessment' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    ]"
                  >
                    {{ activity.category }}
                  </span>
                  <span>•</span>
                  <span>{{ activity.time }}</span>
                </div>
              </div>
              <div class="font-medium text-sm flex items-center gap-1">
                <span :class="activity.action === 'Stock Out' ? 'text-destructive' : 'text-emerald-500'">
                  {{ activity.action === 'Stock Out' ? '-' : '+' }}{{ activity.quantity }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>