import React from 'react';
import { FlightSearchParams, Airport } from '../../middleware/types';
import styles from './SearchForm.module.css';

interface SearchFormProps {
  searchParams: FlightSearchParams;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAirportSearch: (keyword: string, type: 'origin' | 'destination') => void;
  handleSelectAirport: (airport: Airport, type: 'origin' | 'destination') => void;
  originSearchResults: Airport[];
  destinationSearchResults: Airport[];
  handleSearchSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  handleInputChange,
  handleAirportSearch,
  handleSelectAirport,
  originSearchResults,
  destinationSearchResults,
  handleSearchSubmit,
  loading
}) => {
  // Calculate min date for departure (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // Calculate min date for return (based on departure date or today)
  const minReturnDate = searchParams.departureDate || minDate;

  return (
    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="origin" className={styles.label}>From</label>
          <div className={styles.autocompleteContainer}>
            <input
              type="text"
              id="origin"
              placeholder="City or Airport"
              value={searchParams.originLocationCode ? 
                `${searchParams.originLocationCode}` : ''}
              onChange={(e) => {
                handleAirportSearch(e.target.value, 'origin');
              }}
              className={styles.input}
              required
            />
            {originSearchResults.length > 0 && (
              <ul className={styles.autocompleteResults}>
                {originSearchResults.map(airport => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => handleSelectAirport(airport, 'origin')}
                    className={styles.autocompleteItem}
                  >
                    <span className={styles.airportCode}>{airport.iataCode}</span>
                    <span className={styles.airportName}>{airport.name}</span>
                    <span className={styles.airportCity}>{airport.cityName}, {airport.countryName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="destination" className={styles.label}>To</label>
          <div className={styles.autocompleteContainer}>
            <input
              type="text"
              id="destination"
              placeholder="City or Airport"
              value={searchParams.destinationLocationCode ? 
                `${searchParams.destinationLocationCode}` : ''}
              onChange={(e) => {
                handleAirportSearch(e.target.value, 'destination');
              }}
              className={styles.input}
              required
            />
            {destinationSearchResults.length > 0 && (
              <ul className={styles.autocompleteResults}>
                {destinationSearchResults.map(airport => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => handleSelectAirport(airport, 'destination')}
                    className={styles.autocompleteItem}
                  >
                    <span className={styles.airportCode}>{airport.iataCode}</span>
                    <span className={styles.airportName}>{airport.name}</span>
                    <span className={styles.airportCity}>{airport.cityName}, {airport.countryName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="departureDate" className={styles.label}>Departure Date</label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            min={minDate}
            value={searchParams.departureDate}
            onChange={handleInputChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="returnDate" className={styles.label}>Return Date</label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            min={minReturnDate}
            value={searchParams.returnDate}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="adults" className={styles.label}>Passengers</label>
          <select
            id="adults"
            name="adults"
            value={searchParams.adults}
            onChange={handleInputChange}
            className={styles.select}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="travelClass" className={styles.label}>Class</label>
          <select
            id="travelClass"
            name="travelClass"
            value={searchParams.travelClass}
            onChange={handleInputChange}
            className={styles.select}
          >
            <option value="ECONOMY">Economy</option>
            <option value="PREMIUM_ECONOMY">Premium Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className={styles.searchButton} 
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
};

export default SearchForm;