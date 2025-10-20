// src/features/auth/api/authApi.ts
import { handleApiError } from '@/features/common/utils/handleApiError';
import { LoginPayload, LoginResponse, User } from '../types/auth';
import { apiGet, apiPost, ApiResult } from '@/lib/apiFetch';

/**
 * Function to perform user login.
 * @param payload User's email and password data.
 * @returns A promise that resolves with the login response (user and token).
 * @throws ApiErrorResponse in case of error.
 */
export const login = async (payload: LoginPayload): Promise<ApiResult<LoginResponse>> => {
  try {
    const response = await apiPost<LoginResponse>('/auth/login/delivery', payload);
    return response;
  } catch (error: unknown) {
    throw handleApiError(error, 'Unknown error during login');
  }
};


/**
 * Function to get authenticated user data (e.g., when the app loads).
 * @returns A promise that resolves with the User object.
 * @throws ApiErrorResponse in case of error.
 */
export const getMe = async (): Promise<ApiResult<User>> => {
  try {
    const response = await apiGet<User>('/auth/me');
    return response;
  } catch (error: unknown) {
    throw handleApiError(error, 'Unknown error during login');
  }
};

// You can add more functions here for:
// - Password recovery
// - User profile update
// - Email verification, etc.
