// frontend/src/types/item.ts

export type AllocationType = 'TRAINING' | 'NC2';

export interface Item {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  allocation_type: AllocationType;
  allocation_type_display: string; // Read-only from DRF
  created_at: string; // ISO 8601 Date string
  updated_at: string; // ISO 8601 Date string
}

// Payload for creating a new item (POST)
// Omit read-only and auto-generated fields
export interface ItemCreatePayload {
  name: string;
  description?: string | null;
  quantity?: number; // Defaults to 0 in Django if not provided
  unit: string;
  allocation_type: AllocationType;
}

// Payload for updating an existing item (PATCH/PUT)
// All fields are optional for a PATCH request
export interface ItemUpdatePayload {
  name?: string;
  description?: string | null;
  quantity?: number;
  unit?: string;
  allocation_type?: AllocationType;
}

// Optional: Type for paginated responses if you are using DRF pagination
export interface PaginatedItemResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Item[];
}