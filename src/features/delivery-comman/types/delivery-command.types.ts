export interface OrderCommand {
  id: string;
  businessId: string;
  orderId: string;
  command: 'DISPATCH' | 'QUOTE' | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  originName: string | null;
  originAddress: string | null;
  originLatitude: number | null;
  originLongitude: number | null;
  destinationAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  zoneId: string | null;
  notes: string | null;
  quotedCost: number | null;
  externalId: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  data: PaginatedData<T>;
  error: string | null;
  success: boolean;
  timestamp: string;
}

export type OrderCommandListResponse = PaginatedData<OrderCommand>;