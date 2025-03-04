import { User } from '@supabase/supabase-js'
export interface Client {
    id?: number
    name: string,
    phone: string,
    email: string,
    website: string,
    nit: string
}

export interface InvoiceItem {
    id: number;
    invoiceId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: number
    invoiceNumber: string
    client: Client,
    createdAt: string,
    items: Array<Item>
    total: number
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface NewUser extends UserCredentials {
  fullName: string;
}

// Auth response types
export interface LoginResponse {
  user: User | null;
  error: Error | null;
  isAuthorized: boolean;
}

export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

export interface ErrorOnlyResponse {
  error: Error | null;
}

export interface AuthorizationResponse {
  success: boolean;
  error: Error | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_authorized: boolean;
  created_at: string;
}

export interface UsersResponse {
  users: UserProfile[] | null;
  error: Error | null;
}

export { User }