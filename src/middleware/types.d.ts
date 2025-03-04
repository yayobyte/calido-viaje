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

export { User }