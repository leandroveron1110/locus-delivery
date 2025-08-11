"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; // Para integrar Zod con React Hook Form
import { loginSchema } from "../../../lib/zodSchemas"; // Importa el esquema de validación
import { LoginPayload } from "../types/auth";
import { useLogin } from "../hooks/useLogin"; // Importa el hook de login
import { Loader2 } from "lucide-react"; // Icono de carga

export const LoginForm = () => {
  // Inicializa React Hook Form con el esquema de Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Para resetear el formulario después de un envío
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema), // Usa zodResolver para la validación
  });

  // Usa el hook de login de React Query
  const { mutate: loginUser, isPending, isError, error } = useLogin();

  // Función que se ejecuta al enviar el formulario
  const onSubmit = (data: LoginPayload) => {
    loginUser(data, {
      onSuccess: () => {
        reset(); // Limpia el formulario al éxito
      },
    });
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
            {error.message || "Ocurrió un error al iniciar sesión."}
          </span>
        </div>
      )}

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
          // disabled={isLoading} // Deshabilita el input mientras carga
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
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        // disabled={isLoading} // Deshabilita el botón mientras carga
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Iniciando Sesión...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
};
