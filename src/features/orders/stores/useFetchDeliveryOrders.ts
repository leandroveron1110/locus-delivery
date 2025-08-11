// hooks/useFetchDeliveyOrders.ts
import { useEffect } from "react";
import { useDeliveryOrdersStore } from "./useDeliveryOrdersStore";
import { fetchDeliveryById } from "@/features/delivery/api/delivery-api";

export function useFetchDeliveryOrders(businessId: string) {
  const addOrder = useDeliveryOrdersStore((s) => s.addOrder);

  useEffect(() => {
    if (!businessId) return;

    fetch();
  }, [businessId, addOrder]);

  const fetch = async () => {
    const res = await fetchDeliveryById(businessId);

    res.forEach((order: any) => addOrder(order));
  };
}
