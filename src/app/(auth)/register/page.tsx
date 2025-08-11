// src/app/(auth)/register/page.tsx
'use client'; // Necesario para usar hooks de React

import React, { useEffect } from 'react';
import { RegisterForm } from '../../../features/auth/components/RegisterForm'; // Importa el componente del formulario de registro
import { useAuthStore } from '../../../features/auth/store/authStore'; // Importa el store de Zustand
import { useRouter } from 'next/navigation'; // Para la redirección

/**
 * Página de registro de usuario.
 * Si el usuario ya está autenticado, lo redirige a la página principal.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore(); // Obtiene el estado de autenticación

  useEffect(() => {
    // Al montar la página, verifica el estado de autenticación.
    checkAuth();
  }, [checkAuth]); // Se ejecuta solo una vez al montar

  useEffect(() => {
    // Si ya está autenticado y no está cargando la verificación inicial, redirige.
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Redirige a la página principal
    }
  }, [isAuthenticated, isLoading, router]); // Se ejecuta cuando cambian isAuthenticated o isLoading

  // Muestra un loader mientras se verifica la sesión inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, muestra el formulario de registro
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Registrarse en Locus
        </h1>
        <RegisterForm />
        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
