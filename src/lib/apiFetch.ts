// src/api/client.ts
import { AxiosRequestConfig } from "axios";
import api from "@/lib/api";
import { ApiResponse } from "@/types/api";

export type ApiResult<T> = T | null;

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T | null> {
  const res = await api.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T | null> {
  const res = await api.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T | null> {
  const res = await api.put<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<ApiResult<T>> {
  const res = await api.patch<ApiResponse<T>>(url, body);
  return res.data.data ?? null;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T | null> {
  const res = await api.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}
