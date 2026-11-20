// src/mini-back/infrastructure/network/courier-api.ts

import { apiGet, apiPatch, apiPost } from "@/lib/apiFetch";

export enum CourierStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

export enum VehicleType {
  MOTORCYCLE = "MOTORCYCLE",
  BICYCLE = "BICYCLE",
  CAR = "CAR",
  ON_FOOT = "ON_FOOT",
}

export interface Courier {
  id: string;
  dni: string;
  mustChangePassword: boolean;
  fullName: string;
  courierNumber: number;
  phone: string | null;
  vehicleType: VehicleType;
  status: CourierStatus;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourierInput {
  dni: string;
  password: string;
  fullName: string;
  phone?: string;
  courierNumber?: number;
  vehicleType?: VehicleType;
  status?: CourierStatus;
  isAvailable?: boolean;
}

export interface UpdateCourierInput {
  fullName?: string;
  phone?: string;
  vehicleType?: VehicleType;
  status?: CourierStatus;
  isAvailable?: boolean;
}

export interface LoginCourierInput {
  dni: string;
  password: string;
}

export interface ChangeCourierPasswordInput {
  newPassword: string;
}

/**
 * Obtiene todos los cadetes registrados.
 */
export async function fetchCouriers(): Promise<Courier[]> {
  const result = await apiGet<Courier[]>("/couriers");
  return result ?? [];
}

/**
 * Obtiene únicamente los cadetes habilitados y disponibles en turno.
 */
export async function fetchWorkingCouriers(): Promise<Courier[]> {
  const result = await apiGet<Courier[]>("/couriers/working");
  return result ?? [];
}

/**
 * Obtiene un cadete por ID.
 */
export async function fetchCourierById(id: string): Promise<Courier | null> {
  return apiGet<Courier>(`/couriers/${encodeURIComponent(id)}`);
}

/**
 * Crea un nuevo cadete.
 */
export async function createCourier(
  dto: CreateCourierInput,
): Promise<Courier | null> {
  return apiPost<Courier>("/couriers", dto);
}

/**
 * Login de cadete con DNI y contraseña.
 */
export async function loginCourier(
  dto: LoginCourierInput,
): Promise<Courier | null> {
  return apiPost<Courier>("/couriers/login", dto);
}

/**
 * Actualiza datos del cadete (nombre, teléfono, vehículo, estado habilitado/deshabilitado).
 */
export async function updateCourier(
  id: string,
  dto: UpdateCourierInput,
): Promise<Courier | null> {
  return apiPatch<Courier>(`/couriers/${encodeURIComponent(id)}`, dto);
}

/**
 * Cambia el estado de trabajo (disponible / fuera de turno).
 */
export async function setCourierWorkingState(
  id: string,
  isAvailable: boolean,
): Promise<Courier | null> {
  return apiPatch<Courier>(
    `/couriers/${encodeURIComponent(id)}/working-state`,
    { isAvailable },
  );
}

/**
 * Cambia la contraseña del cadete.
 */
export async function changeCourierPassword(
  id: string,
  dto: ChangeCourierPasswordInput,
): Promise<Courier | null> {
  return apiPatch<Courier>(
    `/couriers/${encodeURIComponent(id)}/password`,
    dto,
  );
}