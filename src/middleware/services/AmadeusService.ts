import {
    AmadeusAccessToken,
    AmadeusTokenResponse,
    FlightSearchParams,
    FlightSearchResponse,
    AirportSearchResponse,
    AirlineSearchResponse,
    Airport,
    FlightOffer,
    Dictionaries,
    AmadeusError
  } from '../types';
  
  // Define response interfaces based on Amadeus API structure
  interface AmadeusErrorResponse {
    errors: AmadeusError[];
  }
  
  interface AmadeusFlightOfferResponse {
    data: FlightOffer[];
    dictionaries: Dictionaries;
    meta: {
      count: number;
      links?: {
        self: string;
      };
    };
  }
  
  interface AmadeusAirportResponse {
    data: Array<{
      type: string;
      subType: string;
      name: string;
      iataCode: string;
      address: {
        cityName: string;
        cityCode: string;
        countryName: string;
        countryCode: string;
        regionCode?: string;
      };
    }>;
  }
  
  type AmadeusApiResponse<T> = T | AmadeusErrorResponse;
  
  export class AmadeusService {
    private apiKey: string;
    private apiSecret: string;
    private baseURL: string;
    private token: AmadeusAccessToken | null = null;
  
    constructor() {
      this.apiKey = import.meta.env.VITE_AMADEUS_API_KEY;
      this.apiSecret = import.meta.env.VITE_AMADEUS_API_SECRET;
      this.baseURL = 'https://test.api.amadeus.com';
    }
  
    /**
     * Get or refresh access token
     */
    private async getAccessToken(): Promise<AmadeusTokenResponse> {
      try {
        // Check if token exists and is still valid (with 5 minutes buffer)
        if (this.token && this.token.expiresAt && this.token.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
          return { token: this.token, error: null };
        }
  
        const formData = new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': this.apiKey,
          'client_secret': this.apiSecret
        });
  
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
  
        if (!response.ok) {
          throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json() as {
          access_token: string;
          expires_in: number;
          token_type: string;
        };
  
        // Add expiration time for our tracking
        const token: AmadeusAccessToken = {
          ...data,
          expiresAt: new Date(Date.now() + data.expires_in * 1000)
        };
  
        // Store token for reuse
        this.token = token;
  
        return { token, error: null };
      } catch (error) {
        console.error('Error getting access token:', error);
        return { token: null, error: error instanceof Error ? error : new Error('Unknown error') };
      }
    }
  
    /**
     * Perform authenticated API request
     */
    private async fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
      const { token, error } = await this.getAccessToken();
      
      if (error || !token) {
        throw error || new Error('Failed to get access token');
      }
      
      const url = new URL(path, this.baseURL);
      
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`,
          ...options.headers
        }
      };
      
      const response = await fetch(url.toString(), requestOptions);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json() as Promise<T>;
    }
  
    /**
     * Search for flights based on search parameters
     */
    public async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
      try {
        // Convert params object to URLSearchParams
        const searchParams = new URLSearchParams();
        
        // Add each parameter to the search params
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        
        const url = `/v2/shopping/flight-offers?${searchParams.toString()}`;
        
        const result = await this.fetchWithAuth<AmadeusApiResponse<AmadeusFlightOfferResponse>>(url);
  
        if ('errors' in result) {
          return {
            data: [],
            dictionaries: {},
            error: result.errors[0]
          };
        }
  
        return {
          data: result.data,
          dictionaries: result.dictionaries,
          meta: result.meta,
          error: null
        };
      } catch (error) {
        console.error('Error searching flights:', error);
        return { 
          data: [], 
          dictionaries: {}, 
          error: error instanceof Error ? error : new Error('Unknown error') 
        };
      }
    }
  
    /**
     * Search for airports by keyword
     */
    public async searchAirports(keyword: string): Promise<AirportSearchResponse> {
      try {
        const searchParams = new URLSearchParams({
          subType: 'AIRPORT,CITY',
          keyword,
          'page[limit]': '10'
        });
  
        const url = `/v1/reference-data/locations?${searchParams.toString()}`;
        
        const result = await this.fetchWithAuth<AmadeusApiResponse<AmadeusAirportResponse>>(url);
  
        if ('errors' in result) {
          return {
            data: [],
            error: result.errors[0]
          };
        }
  
        const airports: Airport[] = result.data.map(airport => ({
          name: airport.name,
          iataCode: airport.iataCode,
          address: `${airport.address.cityName}, ${airport.address.countryName}`,
          cityName: airport.address.cityName,
          countryName: airport.address.countryName
        }));
  
        return {
          data: airports,
          error: null
        };
      } catch (error) {
        console.error('Error searching airports:', error);
        return { 
          data: [], 
          error: error instanceof Error ? error : new Error('Unknown error') 
        };
      }
    }
  
    /**
     * Get airline information by IATA code
     */
    public async getAirlines(codes: string[]): Promise<AirlineSearchResponse> {
      try {
        // Amadeus doesn't have a direct airline search endpoint, 
        // so we'll use a hard-coded dataset for the most common airlines
        const airlines = codes.map(code => {
          const airlineInfo = AIRLINE_DATABASE[code] || { name: `Airline ${code}` };
          return {
            code,
            name: airlineInfo.name,
            logo: airlineInfo.logo || `https://pics.avs.io/200/200/${code}.png`
          };
        });
        
        return {
          data: airlines,
          error: null
        };
      } catch (error) {
        console.error('Airline search error:', error);
        return {
          data: [],
          error: error instanceof Error ? error : new Error('Unknown error')
        };
      }
    }
  }
  
  // Common airlines database - unchanged
  const AIRLINE_DATABASE: Record<string, { name: string, logo?: string }> = {
    'AA': { name: 'American Airlines' },
    'DL': { name: 'Delta Air Lines' },
    'UA': { name: 'United Airlines' },
    'LH': { name: 'Lufthansa' },
    'BA': { name: 'British Airways' },
    'AF': { name: 'Air France' },
    'KL': { name: 'KLM Royal Dutch Airlines' },
    'IB': { name: 'Iberia' },
    'EK': { name: 'Emirates' },
    'QR': { name: 'Qatar Airways' },
    'EY': { name: 'Etihad Airways' },
    'AV': { name: 'Avianca' },
    'LA': { name: 'LATAM Airlines' },
    'AM': { name: 'Aeroméxico' },
    'CM': { name: 'Copa Airlines' },
    'B6': { name: 'JetBlue' },
    'WN': { name: 'Southwest Airlines' },
    'FR': { name: 'Ryanair' },
    'U2': { name: 'EasyJet' },
    'DY': { name: 'Norwegian' },
    'AC': { name: 'Air Canada' }
  };