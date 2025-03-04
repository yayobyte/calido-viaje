import { AmadeusService } from "../services/AmadeusService";
import {
  FlightSearchParams,
  FlightSearchResponse,
  AirportSearchResponse,
  AirlineSearchResponse
} from "../types";

export abstract class AmadeusApi {
  private static amadeusService = new AmadeusService();

  /**
   * Search for flights based on search parameters
   */
  static async searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
    return await this.amadeusService.searchFlights(params);
  }

  /**
   * Search for airports by keyword
   */
  static async searchAirports(keyword: string): Promise<AirportSearchResponse> {
    return await this.amadeusService.searchAirports(keyword);
  }

  /**
   * Get airline information by IATA code
   */
  static async getAirlines(codes: string[]): Promise<AirlineSearchResponse> {
    return await this.amadeusService.getAirlines(codes);
  }
}