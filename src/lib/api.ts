// src/lib/api.ts
import axios from 'axios';

// Define la URL base de tu API backend desde las variables de entorno.
// Asegúrate de que NEXT_PUBLIC_API_BASE_URL esté definido en tu .env.local
// Por ejemplo: NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Crea una instancia de Axios.
// Esta instancia será utilizada para todas las peticiones HTTP en tu aplicación.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // Por defecto, enviamos y esperamos JSON
  },
  // Puedes añadir un tiempo de espera global para todas las peticiones
  timeout: 10000, // 10 segundos
});

// --- Interceptores de Petición ---
// Los interceptores te permiten modificar las peticiones antes de que se envíen.
// Aquí podemos añadir el token de autenticación si el usuario está logueado.
api.interceptors.request.use(
  (config) => {
    // Recupera el token de autenticación.
    // En una aplicación real, esto podría venir de un Context, Zustand store, o cookies.
    // Por simplicidad, aquí usamos localStorage como ejemplo (¡no recomendado para tokens sensibles en producción!).
    // Idealmente, usarías cookies HTTP-only para mayor seguridad.
    const token = localStorage.getItem('authToken'); // O de tu authStore de Zustand

    if (token) {
      // Si existe un token, lo añade a la cabecera de autorización.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejo de errores de petición
    return Promise.reject(error);
  }
);

// --- Interceptores de Respuesta ---
// Los interceptores de respuesta te permiten procesar las respuestas del servidor.
// Aquí podemos manejar errores globales, como tokens expirados (401 Unauthorized).
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devuelve.
    return response;
  },
  (error) => {
    // Manejo de errores de respuesta.
    // Si el error es una respuesta HTTP (ej. 401, 403, 500)
    if (error.response) {
      const { status, data } = error.response;

      // Ejemplo de manejo de error 401 (Unauthorized)
      if (status === 401) {
        console.error('Error 401: No autorizado. Token inválido o expirado.');
        // Aquí podrías:
        // 1. Limpiar el token del almacenamiento local/store.
        // 2. Redirigir al usuario a la página de login.
        // localStorage.removeItem('authToken');
        // window.location.href = '/login'; // O usar el useRouter de Next.js
      }
      // Otros códigos de estado (ej. 403 Forbidden, 404 Not Found, 500 Internal Server Error)
      // Puedes añadir lógica específica para cada uno.
      console.error(`Error de API - Estado: ${status}, Mensaje:`, data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta (ej. red caída)
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo sucedió al configurar la petición que disparó un Error
      console.error('Error al configurar la petición:', error.message);
    }
    return Promise.reject(error); // Propaga el error para que sea manejado en el componente/hook
  }
);

export default api;
