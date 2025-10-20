import { ApiError } from "@/types/api"; 

export const getDisplayErrorMessage = (e: unknown): string => {
  const apiError = e as ApiError & { contextMessage?: string };

  if (apiError) {
    let backendMessage: string | undefined;

    if (typeof apiError.message === "string") {
      backendMessage = apiError.message;
    } else if (Array.isArray(apiError.message) && apiError.message.length > 0) {
      backendMessage = apiError.message.join(" | ");
    }

    if (apiError.contextMessage && backendMessage) {
      return `${apiError.contextMessage}: ${backendMessage}`;
    }

    if (backendMessage) {
      return backendMessage;
    }

    if (apiError.contextMessage) {
      return apiError.contextMessage;
    }
  }

  return "Ocurrió un error de conexión o un fallo inesperado. Por favor, inténtalo de nuevo.";
};
