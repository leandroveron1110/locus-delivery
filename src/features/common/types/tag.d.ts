
// Interfaz para el modelo Tag
export interface Tag {
  id: string;
  name: string; // Ej: "PetFriendly", "Wifi", "Delivery"
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
