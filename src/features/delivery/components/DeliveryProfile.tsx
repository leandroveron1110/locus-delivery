"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { updateDeliveryCompany } from "@/features/delivery/api/delivery-api";
import { DeliveryCompany } from "../types/delivery";

interface Props {
  delivery: DeliveryCompany;
}

export default function DeliveryProfile({ delivery }: Props) {
  const router = useRouter();
  const [name, setName] = useState(delivery.name ?? "");
  const [phone, setPhone] = useState(delivery.phone ?? "");
  const [isActive, setIsActive] = useState(delivery.isActive ?? false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Sincronizar el estado local si la prop 'delivery' cambia
  useEffect(() => {
    setName(delivery.name ?? "");
    setPhone(delivery.phone ?? "");
    setIsActive(delivery.isActive ?? false);
  }, [delivery]);

  const getModifiedFields = (): Partial<DeliveryCompany> => {
    const modified: Partial<DeliveryCompany> = {};
    if (name !== delivery.name) modified.name = name;
    if (phone !== delivery.phone) modified.phone = phone;
    if (isActive !== delivery.isActive) modified.isActive = isActive;
    return modified;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const modifiedData = getModifiedFields();

    if (Object.keys(modifiedData).length === 0) {
      setMessage({ type: "info", text: "No hay cambios para guardar." });
      setLoading(false);
      return;
    }

    try {
      await updateDeliveryCompany(delivery.id, modifiedData);
      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });
    } catch {
      setMessage({ type: "error", text: "Error al actualizar el perfil." });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Determinar si hay cambios para habilitar el botón
  const hasChanges =
    name !== delivery.name ||
    phone !== delivery.phone ||
    isActive !== delivery.isActive;

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200 relative">
      {/* Botón de Volver */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Volver atrás"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Perfil de la Compañía
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div className="relative z-0 w-full group">
          <input
            type="text"
            id="name"
            className="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label
            htmlFor="name"
            className="absolute text-md text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >
            Nombre de la compañía
          </label>
        </div>

        {/* Teléfono */}
        <div className="relative z-0 w-full group">
          <input
            type="tel"
            id="phone"
            className="block py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label
            htmlFor="phone"
            className="absolute text-md text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
          >
            Número de teléfono
          </label>
        </div>

        {/* Estado activo (Toggle) */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-md font-medium text-gray-900">
            Compañía Activa
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`p-4 text-sm rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : message.type === "error"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {/* Botón de guardar */}
        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="w-full mt-6 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
