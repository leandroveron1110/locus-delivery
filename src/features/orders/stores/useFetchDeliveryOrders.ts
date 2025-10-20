// hooks/useFetchDeliveyOrders.ts
import { useEffect } from "react";
import { useDeliveryOrdersStore } from "./useDeliveryOrdersStore";
import { fetchDeliveryOrderByDeliveryId } from "@/features/delivery/api/delivery-api";

export function useFetchDeliveryOrders(businessId: string) {
  const addOrder = useDeliveryOrdersStore((s) => s.addOrder);

  useEffect(() => {
    if (!businessId) return;

    fetch();
  }, [businessId, addOrder]);

  const fetch = async () => {
    const res = await fetchDeliveryOrderByDeliveryId(businessId);

    if(res) {
      res.forEach((order) => addOrder(order));

    }

  };
}
