import axios from "@/lib/api";
import { IZone, Zone } from "../types/zone";

// --- Métodos de la API ---

export const fetchDeliveryZonesByDeliveryCompanyId = async (
  companyId: string | null | undefined
): Promise<IZone[]> => {
  const res = await axios.get<IZone[]>(`/delivery-zones/zones/${companyId}`);
  return res.data;
};

export const fetchSaveDeliveryZoneByDeliveryCompanyId = async (
  zone: Zone
) => {
  const res = await axios.post(`/delivery-zones`, zone);
  return res.data;
};

// Nuevo: método para actualizar una zona de entrega
export const fetchUpdateDeliveryZone = async (
  id: string,
  data: Partial<IZone> // Usamos Partial<IZone> para permitir actualizaciones parciales
) => {
  console.log("id", id)
  console.log("data", data)
  const res = await axios.patch(`/delivery-zones/${id}`, data);
  return res.data;
};

// Nuevo: método para eliminar una zona de entrega
export const fetchDeleteDeliveryZone = async (id: string) => {
  const res = await axios.delete(`/delivery-zones/${id}`);
  return res.data;
};
