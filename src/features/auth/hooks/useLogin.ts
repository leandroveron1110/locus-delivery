// src/features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore'; // Importa tu store de Zustand
import { login as apiLogin } from '../api/authApi'; // Importa la función de login de la API
import { LoginPayload, LoginResponse, User } from '../types/auth';
import { useRouter } from 'next/navigation'; // Para la redirección después del login

/**
 * Hook personalizado para manejar la lógica de inicio de sesión.
 * Utiliza useMutation de React Query para la llamada a la API
 * y actualiza el store de Zustand con el estado de autenticación.
 */
export const useLogin = () => {
  const authStoreLogin = useAuthStore((state) => state.login); // Obtiene la acción login de Zustand
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: apiLogin, // La función que realiza la llamada a la API
    onSuccess: (data) => {
      // Esta función se ejecuta si la mutación (login) es exitosa
      authStoreLogin(data); // Actualiza el store de Zustand con los datos del usuario
      console.log('Login exitoso:', data);
      // Redirige al usuario a la página principal o a la que intentaba acceder
      const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectPath);
    },
    onError: (error) => {
      // Esta función se ejecuta si la mutación (login) falla
      console.error('Error en el login:', error);
      // El error ya es manejado por el interceptor de Axios y el store de Zustand,
      // pero puedes añadir lógica adicional aquí si es necesario.
      // Por ejemplo, mostrar un mensaje de error global con un toast.
    },
  });
};
