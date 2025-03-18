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
    items: InvoiceItem[];
    payments?: Payment[];
    createdAt: string;
    updatedAt: string;
    total?: number;         // Added by processAllInvoices
    totalPaid?: number;     // Added by processAllInvoices
    balanceDue?: number;    // Added by processAllInvoices
    paymentStatus?: 'paid' | 'partial' | 'unpaid'; // Added by processAllInvoices
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
  travelClass: string;
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
  source?: {
    pointer: string;
    parameter?: string;
  };
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
  additionalServices?: {
    amount: string;
    type: string;
  }[];
}

export interface FlightSegment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  class: string;
  includedCheckedBags?: {
    quantity: number;
  };
  includedCabinBags?: {
    quantity: number;
  };
  amenities?: {
    description: string;
    isChargeable: boolean;
    amenityType: string;
    amenityProvider: {
      name: string;
    };
  }[];
}

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  isUpsellOffer: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: FlightOfferPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

// Define the Dictionaries type to match what the API actually returns
export interface Dictionaries {
  carriers?: Record<string, string>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries?: Dictionaries; // Make it match the Dictionaries interface above
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
  error: AmadeusError | null;
}

export interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    paymentDate: string;
    createdAt: string;
    updatedAt: string;
}

export { User }