export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarId?: string | null;
}

export interface Address {
  id: string;
  street: string;
  number?: string | null;
  apartment?: string | null;
  city: string;
  province: string;
  country: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  enabled: boolean;
  notes?: string | null;
}

export interface OrderOption {
  id: string;
  opcionId?: string | null;
  optionName: string;
  priceFinal: number;
  priceWithoutTaxes: number;
  taxesAmount: number;
  priceModifierType: string;
  quantity: number;
}

export interface OrderOptionGroup {
  id: string;
  opcionGrupoId?: string | null;
  groupName: string;
  minQuantity: number;
  maxQuantity: number;
  quantityType: string;
  options: OrderOption[];
}

export interface OrderItem {
  id: string;
  productName: string;
  productDescription?: string | null;
  productImageUrl?: string | null;
  quantity: number;
  priceAtPurchase: number;
  notes?: string | null;
  optionGroups: OrderOptionGroup[];
}

export interface Order {
  id: string;
  businessId: string;
  status: string;
  origin: string;
  isTest: boolean;
  total: number;
  notes: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  user: User;
  pickupAddress?: Address | null;
  deliveryAddress?: Address | null;
  items: OrderItem[];
  discounts: any[]; // Según tu ejemplo está vacío, pero podés definir la interface si tenés datos
}


export enum OrderStatus {
  PENDING,
  CONFIRMED,
  IN_DELIVERY,
  DELIVERED,
  CANCELLED
}
