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
    status: OrderStatus;
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
    // 1. Creación y pago
    PENDING = "PENDING",                         // Pedido creado (sin pago y sin confirmar)
    WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT", // Pedido esperando pago
    PAYMENT_IN_PROGRESS = "PAYMENT_IN_PROGRESS", // Pago en curso
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",     // Pago confirmado

    // 2. Confirmación y preparación en negocio
    PENDING_CONFIRMATION = "PENDING_CONFIRMATION", // Esperando que el negocio acepte
    CONFIRMED = "CONFIRMED",                       // Negocio aceptó el pedido
    REJECTED_BY_BUSINESS = "REJECTED_BY_BUSINESS", // Negocio rechazó antes de preparar
    PREPARING = "PREPARING",                       // Pedido en preparación

    // 2.1 Pedido listo
    READY_FOR_CUSTOMER_PICKUP = "READY_FOR_CUSTOMER_PICKUP", // Pedido listo para retiro por el cliente
    READY_FOR_DELIVERY_PICKUP = "READY_FOR_DELIVERY_PICKUP", // Pedido listo y negocio llamó al delivery

    // 3. Asignación de delivery
    DELIVERY_PENDING = "DELIVERY_PENDING",         // Buscando delivery para asignar
    DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED",       // Delivery asignado, esperando aceptación
    DELIVERY_ACCEPTED = "DELIVERY_ACCEPTED",       // Delivery aceptó la asignación
    DELIVERY_REJECTED = "DELIVERY_REJECTED",       // Delivery rechazó la asignación
    DELIVERY_REASSIGNING = "DELIVERY_REASSIGNING", // Buscando otro delivery tras rechazo

    // 4. Transporte
    OUT_FOR_PICKUP = "OUT_FOR_PICKUP",             // Delivery yendo al negocio a buscar el pedido
    PICKED_UP = "PICKED_UP",                       // Pedido recogido por el delivery
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",         // Delivery en camino al cliente

    // 5. Entrega y finalización
    DELIVERED = "DELIVERED",                       // Pedido entregado con éxito
    DELIVERY_FAILED = "DELIVERY_FAILED",           // No se pudo entregar el pedido
    RETURNED = "RETURNED",                         // Pedido devuelto al negocio
    REFUNDED = "REFUNDED",                         // Dinero devuelto al cliente
    COMPLETED = "COMPLETED",                       // Pedido cerrado y finalizado

    // 6. Cancelaciones
    CANCELLED_BY_USER = "CANCELLED_BY_USER",       // Cancelado por el cliente
    CANCELLED_BY_BUSINESS = "CANCELLED_BY_BUSINESS", // Cancelado por el negocio
    CANCELLED_BY_DELIVERY = "CANCELLED_BY_DELIVERY", // Cancelado por el delivery

    // 7. Errores generales
    FAILED = "FAILED"                              // Error general (pago rechazado, problema interno)
  }

  // Estados que maneja el DELIVERY
  export enum EOrderStatusDelivery {
    DELIVERY_PENDING = "DELIVERY_PENDING",         // Buscando delivery para asignar
    READY_FOR_DELIVERY_PICKUP = "READY_FOR_DELIVERY_PICKUP", // Pedido listo y negocio llamó al delivery
    DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED",       // Delivery asignado, esperando aceptación
    DELIVERY_ACCEPTED = "DELIVERY_ACCEPTED",       // Delivery aceptó la asignación
    DELIVERY_REJECTED = "DELIVERY_REJECTED",       // Delivery rechazó la asignación
    DELIVERY_REASSIGNING = "DELIVERY_REASSIGNING", // Buscando otro delivery tras rechazo

    OUT_FOR_PICKUP = "OUT_FOR_PICKUP",             // Delivery yendo al negocio a buscar el pedido
    PICKED_UP = "PICKED_UP",                       // Pedido recogido por el delivery
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",         // Delivery en camino al cliente

    DELIVERED = "DELIVERED",                       // Pedido entregado con éxito
    DELIVERY_FAILED = "DELIVERY_FAILED",           // No se pudo entregar el pedido

    CANCELLED_BY_DELIVERY = "CANCELLED_BY_DELIVERY" // Cancelado por el delivery
  }

  // Estados que maneja el NEGOCIO
  export enum EOrderStatusBusiness {
    PENDING_CONFIRMATION = "PENDING_CONFIRMATION", // Esperando que el negocio acepte
    CONFIRMED = "CONFIRMED",                       // Negocio aceptó el pedido
    REJECTED_BY_BUSINESS = "REJECTED_BY_BUSINESS", // Negocio rechazó antes de preparar
    PREPARING = "PREPARING",                       // Pedido en preparación

    READY_FOR_CUSTOMER_PICKUP = "READY_FOR_CUSTOMER_PICKUP", // Pedido listo para retiro por el cliente
    READY_FOR_DELIVERY_PICKUP = "READY_FOR_DELIVERY_PICKUP", // Pedido listo y negocio llamó al delivery

    DELIVERY_PENDING = "DELIVERY_PENDING",         // Buscando delivery para asignar
    DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED",       // Delivery asignado, esperando aceptación
    DELIVERY_REASSIGNING = "DELIVERY_REASSIGNING", // Buscando otro delivery tras rechazo

    CANCELLED_BY_BUSINESS = "CANCELLED_BY_BUSINESS" // Cancelado por el negocio
  }

  // Estados que el CLIENTE puede provocar directamente
  export enum EOrderStatusUser {
    PENDING = "PENDING",                         // Pedido creado (sin pago y sin confirmar)
    WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT", // Pedido esperando pago
    PAYMENT_IN_PROGRESS = "PAYMENT_IN_PROGRESS", // Pago en curso
    PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",     // Pago confirmado

    CANCELLED_BY_USER = "CANCELLED_BY_USER"      // Cancelado por el cliente
  }

