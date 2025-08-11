// src/features/auth/components/RegisterForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Para integrar Zod con React Hook Form
import { registerSchema } from "../../../lib/zodSchemas"; // Importa el esquema de validación para registro
import { useRegister } from "../hooks/useRegister"; // Importa el hook de registro
import { Loader2 } from "lucide-react"; // Icono de carga
import z from "zod";

enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

/**
 * Componente del formulario de registro de usuario.
 * Maneja la entrada del usuario, la validación y el envío de datos de registro.
 */
export const RegisterForm = () => {
  // Inicializa React Hook Form con el esquema de Zod para el registro

  type RegisterFormData = z.infer<typeof registerSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Para resetear el formulario después de un envío
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema), // Usa zodResolver para la validación
  });

  // Usa el hook de registro de React Query
  const { mutate: registerUser, isPending, error, isError } = useRegister();

  // Función que se ejecuta al enviar el formulario
  const onSubmit = (data: RegisterFormData) => {
    registerUser(
      {
        ...data,
        role: UserRole.CLIENT,
      },
      {
        onSuccess: () => {
          reset(); // Limpia el formulario al éxito
          // La redirección se maneja dentro del hook useRegister
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-md"
    >
      {/* Mensaje de error general si la mutación falla */}
      {isError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">
            {error?.message || "Ocurrió un error al registrar el usuario."}
          </span>
        </div>
      )}

      <div>
        <label
          htmlFor="firstName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre
        </label>
        <input
          id="firstName"
          type="text"
          {...register("firstName")} // Registra el input con React Hook Form
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Tu nombre"
          disabled={isPending} // Deshabilita el input mientras carga
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.firstName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lastName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Apellido
        </label>
        <input
          id="lastName"
          type="text"
          {...register("lastName")} // Registra el input con React Hook Form
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Tu apellido"
          disabled={isPending} // Deshabilita el input mientras carga
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          {...register("email")} // Registra el input con React Hook Form
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="tu@ejemplo.com"
          disabled={isPending} // Deshabilita el input mientras carga
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          {...register("password")} // Registra el input con React Hook Form
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="••••••••"
          disabled={isPending} // Deshabilita el input mientras carga
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        disabled={isPending} // Deshabilita el botón mientras carga
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Registrando...
          </>
        ) : (
          "Registrarse"
        )}
      </button>
    </form>
  );
};
