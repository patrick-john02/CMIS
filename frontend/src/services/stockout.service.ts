// frontend/src/services/stockout.service.ts
import { apiClient } from './api';
import type { 
  StockOutTransaction, 
  StockOutCreatePayload, 
  StockOutUpdatePayload 
} from '@/types/stockout';

const ENDPOINT = '/stock-outs/';

export const StockOutService = {
  /**
   * Retrieve a list of all stock-out transactions.
   */
  async getStockOuts(): Promise<StockOutTransaction[]> {
    const response = await apiClient.get<StockOutTransaction[]>(ENDPOINT);
    return response.data;
  },

  /**
   * Retrieve a single stock-out transaction by its ID.
   */
  async getStockOut(id: number): Promise<StockOutTransaction> {
    const response = await apiClient.get<StockOutTransaction>(`${ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Create a new stock-out transaction.
   * This will trigger your Django signal to deduct the Item's quantity.
   */
  async createStockOut(payload: StockOutCreatePayload): Promise<StockOutTransaction> {
    const response = await apiClient.post<StockOutTransaction>(ENDPOINT, payload);
    return response.data;
  },

  /**
   * Update a stock-out transaction's details (e.g., modifying remarks).
   * Warning: Modifying `quantity_deducted` might require complex signal handling in DRF to adjust item inventory accurately.
   */
  async updateStockOut(id: number, payload: StockOutUpdatePayload): Promise<StockOutTransaction> {
    const response = await apiClient.patch<StockOutTransaction>(`${ENDPOINT}${id}/`, payload);
    return response.data;
  },

  /**
   * Delete a stock-out transaction.
   */
  async deleteStockOut(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}${id}/`);
  }
};