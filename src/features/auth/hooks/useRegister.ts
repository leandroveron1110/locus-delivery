// src/features/auth/hooks/useRegister.ts
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore'; // Importa tu store de Zustand
import { register as apiRegister } from '../api/authApi'; // Importa la función de registro de la API
import { RegisterPayload, RegisterResponse, User } from '../types/auth';
import { useRouter } from 'next/navigation'; // Para la redirección después del registro

/**
 * Hook personalizado para manejar la lógica de registro de un nuevo usuario.
 * Utiliza useMutation de React Query para la llamada a la API
 * y actualiza el store de Zustand con el estado de autenticación.
 */
export const useRegister = () => {
  const authStoreRegister = useAuthStore((state) => state.register); // Obtiene la acción register de Zustand
  const router = useRouter();

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: apiRegister, // La función que realiza la llamada a la API
    onSuccess: (user) => {
      // Esta función se ejecuta si la mutación (registro) es exitosa
      authStoreRegister(user); // Actualiza el store de Zustand con los datos del usuario
      console.log('Registro exitoso:', user);
      // Redirige al usuario a la página principal o a donde sea apropiado después del registro
      router.push('/');
    },
    onError: (error) => {
      // Esta función se ejecuta si la mutación (registro) falla
      console.error('Error en el registro:', error);
      // Puedes añadir lógica adicional aquí para mostrar mensajes de error.
    },
  });
};
