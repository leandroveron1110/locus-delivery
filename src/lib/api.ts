// src/lib/api.ts
import { ApiResponse } from "@/types/api";
import axios, {
  AxiosError,
  AxiosInstance
} from "axios";
import Router from "next/router"; // Para redirección en Next.js

// URL base de la API desde variables de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL no está definida en .env.local");
}

// Creamos la instancia de Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor de peticiones
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token de cookies (recomendado) o localStorage como fallback
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const { status, data: apiResponse } = error.response;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          Router.push("/login");
        }
      }

      if (apiResponse && apiResponse.error) {
        return Promise.reject(apiResponse.error);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Interceptor para normalizar las
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const { status, data: apiResponse } = error.response;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          Router.push("/login");
        }
      }

      if (apiResponse && apiResponse.error) {
        return Promise.reject(apiResponse.error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
