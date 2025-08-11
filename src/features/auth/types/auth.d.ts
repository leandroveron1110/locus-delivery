// src/features/auth/types/auth.d.ts
export enum UserRole {
  CLIENT = 'CLIENT',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

// Interface for the User model as we would receive it from the API.
// Sensitive fields like passwordHash are omitted.
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string; // Dates usually come as ISO strings from the API
  updatedAt: string;
  statusId?: string;
  avatarId?: string;
  // You can include relations if the API nests them, e.g.:
  // avatar?: Image; // If the API returns the nested Image object
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
  register: (payload: RegisterResponse) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// NUEVA INTERFAZ: Combina el estado y las acciones para el tipo completo del store
export interface AuthStore extends AuthState, AuthStoreActions {}
