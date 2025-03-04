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

// Token types
export interface AmadeusAccessToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expiresAt: Date;
}

export interface AmadeusTokenResponse {
  token: AmadeusAccessToken | null;
  error: Error | null;
}

// Search parameters
export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  includedAirlineCodes?: string;
  excludedAirlineCodes?: string;
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

// Airport related types
export interface Airport {
  name: string;
  iataCode: string;
  address: string;
  cityName: string;
  countryName: string;
}

// Define a specific error structure for Amadeus errors
export interface AmadeusError {
  status: number;
  code: string;
  title: string;
  detail: string;
}

export interface AirportSearchResponse {
  data: Airport[];
  error: AmadeusError | Error | null;
}

// Airline related types
export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface AirlineSearchResponse {
  data: Airline[];
  error: AmadeusError | Error | null;
}

// Flight offer related types
export interface FlightOfferPrice {
  currency: string;
  total: string;
  base: string;
  fees: {
    amount: string;
    type: string;
  }[];
  grandTotal: string;
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface Traveler {
  id: string;
  travelerType: string;
  associatedAdultId?: string;
  fareOption: string;
  price: {
    currency: string;
    total: string;
    base: string;
    taxes?: {
      amount: string;
      code: string;
    }[];
  };
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: FlightOfferPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Traveler[];
}

export interface Dictionaries {
  locations?: Record<string, {
    cityCode: string;
    countryCode: string;
  }>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
  carriers?: Record<string, string>;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries: Dictionaries;
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
  error: AmadeusError | Error | null;
}

export { User }