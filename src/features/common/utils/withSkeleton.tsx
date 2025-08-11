import dynamic from "next/dynamic";
import React from "react";

/**
 * Carga dinámica de componentes con skeleton personalizado.
 *
 * @template T - Props del componente.
 * @param importFn - Función que importa el componente dinámicamente.
 * @param Skeleton - Componente Skeleton que se muestra mientras se carga.
 * @returns Componente dinámico con skeleton.
 */
export const withSkeleton = <T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  Skeleton: React.FC
) =>
  dynamic(importFn, {
    loading: () => <Skeleton />,
  });
