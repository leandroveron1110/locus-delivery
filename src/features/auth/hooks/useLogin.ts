// src/features/auth/hooks/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore"; // Importa tu store de Zustand
import { login as apiLogin } from "../api/authApi"; // Importa la función de login de la API
import { LoginPayload, LoginResponse } from "../types/auth";
import { useRouter } from "next/navigation"; // Para la redirección después del login
import { ApiResult } from "@/lib/apiFetch";
import { ApiError } from "@/types/api";

export const useLogin = () => {
  const authStoreLogin = useAuthStore((state) => state.login); // Obtiene la acción login de Zustand
  const router = useRouter();

  return useMutation<ApiResult<LoginResponse>, ApiError, LoginPayload>({
    mutationFn: apiLogin, // La función que realiza la llamada a la API
    onSuccess: (data) => {
      if (data) {
        authStoreLogin(data);
        const redirectPath =
          new URLSearchParams(window.location.search).get("redirect") || "/";
        router.push(redirectPath);
      }
    },
  });
};
