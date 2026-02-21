// frontend/src/services/item.service.ts
import { apiClient } from './api';
import type { Item, ItemCreatePayload, ItemUpdatePayload } from '@/types/item';

const ENDPOINT = '/items/';

export const ItemService = {
  /**
   * Retrieve a list of all items.
   * If DRF pagination is enabled, this will return PaginatedItemResponse.
   * Modify the return type based on your DRF settings.
   */
  async getItems(): Promise<Item[]> {
    // If using DRF standard pagination, change return type to PaginatedItemResponse
    // and return response.data directly.
    const response = await apiClient.get<Item[]>(ENDPOINT);
    return response.data;
  },

  /**
   * Retrieve a single item by its ID.
   */
  async getItem(id: number): Promise<Item> {
    const response = await apiClient.get<Item>(`${ENDPOINT}${id}/`);
    return response.data;
  },

  /**
   * Create a new item in the inventory.
   */
  async createItem(payload: ItemCreatePayload): Promise<Item> {
    const response = await apiClient.post<Item>(ENDPOINT, payload);
    return response.data;
  },

  /**
   * Update an existing item (Partial Update / PATCH).
   */
  async updateItem(id: number, payload: ItemUpdatePayload): Promise<Item> {
    const response = await apiClient.patch<Item>(`${ENDPOINT}${id}/`, payload);
    return response.data;
  },

  /**
   * Delete an item from the inventory.
   */
  async deleteItem(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINT}${id}/`);
  }
};