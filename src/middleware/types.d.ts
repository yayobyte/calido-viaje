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

export interface User {
  id: string;
  email: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: {
    email: string;
    email_verified: boolean;
    full_name?: string;
    phone_verified: boolean;
    sub: string;
  };
  identities?: Array<{
    identity_id: string;
    id: string;
    user_id: string;
    identity_data: {
      email: string;
      email_verified: boolean;
      full_name?: string;
      phone_verified: boolean;
      sub: string;
    };
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface NewUser extends UserCredentials {
  fullName: string;
}