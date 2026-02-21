// frontend/src/types/stockout.ts

export interface StockOutTransaction {
  id: number;
  item: number; // ID of the related Item
  item_name: string; // Read-only from DRF
  item_unit: string; // Read-only from DRF
  quantity_deducted: number;
  release_date: string; // ISO 8601 Date string, auto-generated
  remarks: string | null;
  released_by: number | null; // ID of the User
  released_by_name: string; // Read-only from DRF
}

// Payload for creating a new stock-out transaction (POST)
// Omit auto-generated and read-only fields
export interface StockOutCreatePayload {
  item: number; // ID of the Item being released
  quantity_deducted: number;
  remarks?: string | null;
  // `released_by` is typically set in the DRF view via `request.user`,
  // but if your API expects it in the payload, you can include it here.
}

// Payload for updating a transaction (PATCH)
// Note: In strict inventory systems, editing transactions is often restricted.
export interface StockOutUpdatePayload {
  quantity_deducted?: number;
  remarks?: string | null;
}

// Optional: Type for paginated responses if you are using DRF pagination
export interface PaginatedStockOutResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StockOutTransaction[];
}