// src/types/api.d.ts

// Defines a generic structure for paginated API responses.
// T represents the type of items in the list (e.g., Business, Product, User).
export interface PaginatedResponse<T> {
  data: T[]; // The list of items
  meta: {
    total: number; // Total number of available items
    page: number; // Current page
    limit: number; // Item limit per page
    totalPages: number; // Total number of pages
  };
}

// Defines a generic structure for pagination/filtering parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  // You can add more common parameters here, such as 'orderBy', 'sortDirection', etc.
}

// Defines a generic structure for an API error response
export interface ApiError {
  statusCode: number;
  message: string | string[];
  contextMessage: string;
  errorCode?: string; 
  timestamp: string;
  path: string;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError| null;
  success: boolean;
  timestamp: string;
}

