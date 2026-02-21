// frontend/src/composables/useItems.ts
import { ref } from 'vue';
import { ItemService } from '@/services/item.service';
import type { Item, ItemCreatePayload, ItemUpdatePayload } from '@/types/item';

export function useItems() {
  const items = ref<Item[]>([]);
  const currentItem = ref<Item | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all items and populate the reactive `items` array.
   */
  const fetchItems = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await ItemService.getItems();
      // If using pagination: items.value = data.results;
      items.value = data; 
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch inventory items.';
      console.error('Error fetching items:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch a specific item and set it as `currentItem`.
   */
  const fetchItem = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await ItemService.getItem(id);
      currentItem.value = data;
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || `Failed to fetch item ${id}.`;
      console.error(`Error fetching item ${id}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Create a new item and append it to the local state if successful.
   */
  const createItem = async (payload: ItemCreatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newItem = await ItemService.createItem(payload);
      items.value.push(newItem);
      return newItem;
    } catch (err: any) {
      // Handles DRF validation errors (e.g., {"name": ["This field is required."]})
      error.value = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create item.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update an item and reflect the changes in the local state immediately.
   */
  const updateItem = async (id: number, payload: ItemUpdatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedItem = await ItemService.updateItem(id, payload);
      
      // Update the item in the local list
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = updatedItem;
      }
      
      // Update currentItem if it's the one being edited
      if (currentItem.value?.id === id) {
        currentItem.value = updatedItem;
      }
      
      return updatedItem;
    } catch (err: any) {
      error.value = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update item.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete an item and remove it from the local state.
   */
  const deleteItem = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await ItemService.deleteItem(id);
      items.value = items.value.filter(item => item.id !== id);
      if (currentItem.value?.id === id) {
        currentItem.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete item.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    currentItem,
    isLoading,
    error,
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem
  };
}