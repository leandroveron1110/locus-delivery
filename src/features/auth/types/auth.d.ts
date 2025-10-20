// src/features/auth/types/auth.d.ts
export enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export interface IDeliveries {
  id: string;
  role: UserRole,
  permissions: string[]
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  deliveries
}

// Interface for the data needed for login
export interface LoginPayload {
  email: string;
  password: string;
}

// Interface for a successful login response
export interface LoginResponse {
  user: User;
  accessToken: string; // The authentication token (e.g., JWT)
}

// Interface for the data needed to register a new user
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // Optional, the backend might assign a default role
}

// Interface for a successful registration response (similar to login, or just the user)
export interface RegisterResponse {
  user: User;
  accessToken: string; // The authentication token
}

// Types for the authentication state in the frontend
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To indicate if the initial session is being verified
  error: string | null;
}

// NUEVA INTERFAZ: Define los tipos para las acciones (funciones) del store
export interface AuthStoreActions {
  login: (payload: LoginResponse) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// NUEVA INTERFAZ: Combina el estado y las acciones para el tipo completo del store
export interface AuthStore extends AuthState, AuthStoreActions {}
