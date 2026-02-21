// frontend/src/composables/useStockOuts.ts
import { ref } from 'vue';
import { StockOutService } from '@/services/stockout.service';
import type { 
  StockOutTransaction, 
  StockOutCreatePayload, 
  StockOutUpdatePayload 
} from '@/types/stockout';

export function useStockOuts() {
  const stockOuts = ref<StockOutTransaction[]>([]);
  const currentStockOut = ref<StockOutTransaction | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all stock-out transactions.
   */
  const fetchStockOuts = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await StockOutService.getStockOuts();
      stockOuts.value = data; 
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch stock-out history.';
      console.error('Error fetching stock-outs:', err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch a specific transaction.
   */
  const fetchStockOut = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await StockOutService.getStockOut(id);
      currentStockOut.value = data;
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.detail || `Failed to fetch transaction ${id}.`;
      console.error(`Error fetching stock-out ${id}:`, err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Record a new stock-out transaction.
   */
  const createStockOut = async (payload: StockOutCreatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newTransaction = await StockOutService.createStockOut(payload);
      // Prepend the new transaction to the start of the list to reflect recency
      stockOuts.value.unshift(newTransaction);
      return newTransaction;
    } catch (err: any) {
      // Handles DRF validation, specifically the custom quantity check you added
      error.value = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to record stock-out.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update an existing transaction (e.g., fixing remarks).
   */
  const updateStockOut = async (id: number, payload: StockOutUpdatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedTransaction = await StockOutService.updateStockOut(id, payload);
      
      const index = stockOuts.value.findIndex(txn => txn.id === id);
      if (index !== -1) {
        stockOuts.value[index] = updatedTransaction;
      }
      
      if (currentStockOut.value?.id === id) {
        currentStockOut.value = updatedTransaction;
      }
      
      return updatedTransaction;
    } catch (err: any) {
      error.value = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update transaction.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Delete a transaction from history.
   */
  const deleteStockOut = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await StockOutService.deleteStockOut(id);
      stockOuts.value = stockOuts.value.filter(txn => txn.id !== id);
      if (currentStockOut.value?.id === id) {
        currentStockOut.value = null;
      }
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to delete transaction.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    stockOuts,
    currentStockOut,
    isLoading,
    error,
    fetchStockOuts,
    fetchStockOut,
    createStockOut,
    updateStockOut,
    deleteStockOut
  };
}