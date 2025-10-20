// src/utils/handleApiError.ts
import { ApiError } from "@/types/api"; 
import { AxiosError } from "axios";

// Helper para validar si un objeto es tu ApiError de frontend
const isApiError = (e: unknown): e is ApiError =>
  typeof e === "object" &&
  e !== null &&
  "statusCode" in e &&
  "message" in e &&
  "path" in e;

// Tipo seguro para manejar respuesta desconocida de backend
type UnknownApiResponse = { message?: string; error?: unknown };

export const handleApiError = (
  error: unknown,
  defaultMessage: string
): ApiError & { contextMessage?: string } => {
  // 1. Manejo de errores de Axios
  if (error instanceof AxiosError && error.response) {
    const apiResponseData = error.response.data as UnknownApiResponse;

    // A. El backend devolvió el objeto de error esperado
    if (apiResponseData?.error && isApiError(apiResponseData.error)) {
      return {
        ...apiResponseData.error,
        contextMessage: defaultMessage,
      };
    }

    // B. Axios devolvió algo pero no en el formato esperado
    const message =
      typeof apiResponseData?.message === "string"
        ? apiResponseData.message
        : defaultMessage;

    return {
      statusCode: error.response?.status ?? 500,
      message,
      contextMessage: defaultMessage,
      timestamp: new Date().toISOString(),
      path: error.config?.url ?? window.location.pathname,
    };
  }

  // 2. Errores que ya son ApiError
  if (isApiError(error)) {
    return {
      ...error,
      contextMessage: defaultMessage,
    };
  }

  // 3. Error desconocido
  return {
    statusCode: 500,
    message: defaultMessage,
    contextMessage: defaultMessage,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };
};
