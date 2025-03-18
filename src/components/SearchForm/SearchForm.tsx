import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FlightSearchParams, Airport } from '../../middleware/types';
import styles from './SearchForm.module.css';

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Skip the debounce logic for very short strings to avoid unnecessary updates
    if (typeof value === 'string' && value.length < 2) {
      setDebouncedValue(value); // Just update immediately for short strings
      return;
    }
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

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
  // Add local state to track input values
  const [originInput, setOriginInput] = useState(searchParams.originLocationCode || '');
  const [destinationInput, setDestinationInput] = useState(searchParams.destinationLocationCode || '');
  
  // Use refs to track if search is in progress to prevent duplicate calls
  const isOriginSearching = useRef(false);
  const isDestinationSearching = useRef(false);
  
  // Track last searched terms to prevent duplicate searches
  const lastOriginSearch = useRef<string>('');
  const lastDestinationSearch = useRef<string>('');
  
  // Create debounced versions with an even longer delay (700ms)
  const debouncedOriginInput = useDebounce(originInput, 700); 
  const debouncedDestinationInput = useDebounce(destinationInput, 700);
  
  // Calculate min date for departure (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  // Calculate min date for return (based on departure date or today)
  const minReturnDate = searchParams.departureDate || minDate;

  // First, add state to track loading state for each input
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  // Handle origin input change
  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginInput(value);
    
    // Clear results immediately if input is emptied
    if (value.trim().length < 2 && originSearchResults.length > 0) {
      // Clear search results by calling with empty string
      handleAirportSearch('', 'origin');
    }
  };

  // Handle destination input change
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    
    // Clear results immediately if input is emptied
    if (value.trim().length < 2 && destinationSearchResults.length > 0) {
      // Clear search results by calling with empty string
      handleAirportSearch('', 'destination');
    }
  };

  // Handle debounced search for origin with additional safeguards
  useEffect(() => {
    const trimmedInput = debouncedOriginInput.trim();
    
    if (
      trimmedInput.length >= 2 && 
      trimmedInput !== lastOriginSearch.current && 
      !isOriginSearching.current &&
      !/^[A-Z]{3}$/.test(trimmedInput)
    ) {
      isOriginSearching.current = true;
      lastOriginSearch.current = trimmedInput;
      
      // Show spinner before search
      setOriginLoading(true);
      
      // Execute the search
      handleAirportSearch(trimmedInput, 'origin');
      
      // Reset the searching flag and hide spinner after a short delay
      setTimeout(() => {
        isOriginSearching.current = false;
        setOriginLoading(false);
      }, 300);
    }
  }, [debouncedOriginInput, handleAirportSearch]);

  // Handle debounced search for destination with additional safeguards
  useEffect(() => {
    const trimmedInput = debouncedDestinationInput.trim();
    
    if (
      trimmedInput.length >= 2 && 
      trimmedInput !== lastDestinationSearch.current && 
      !isDestinationSearching.current &&
      !/^[A-Z]{3}$/.test(trimmedInput)
    ) {
      isDestinationSearching.current = true;
      lastDestinationSearch.current = trimmedInput;
      
      // Show spinner before search
      setDestinationLoading(true);
      
      // Execute the search
      handleAirportSearch(trimmedInput, 'destination');
      
      // Reset the searching flag and hide spinner after a short delay
      setTimeout(() => {
        isDestinationSearching.current = false;
        setDestinationLoading(false);
      }, 300);
    }
  }, [debouncedDestinationInput, handleAirportSearch]);

  // Update local input state when airport is selected
  const handleAirportSelection = (airport: Airport, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginInput(airport.iataCode);
      lastOriginSearch.current = airport.iataCode; // Update the last search

      // Explicitly clear results to prevent dropdown from showing again
      setTimeout(() => {
        if (airport.iataCode === originInput) {
          handleAirportSearch('', 'origin');
        }
      }, 100);
    } else {
      setDestinationInput(airport.iataCode);
      lastDestinationSearch.current = airport.iataCode; // Update the last search

      // Explicitly clear results to prevent dropdown from showing again
      setTimeout(() => {
        if (airport.iataCode === destinationInput) {
          handleAirportSearch('', 'destination');
        }
      }, 100);
    }
    
    // Disable searching for a while after selection to prevent the duplicate API call
    if (type === 'origin') {
      isOriginSearching.current = true;
      setTimeout(() => {
        isOriginSearching.current = false;
      }, 1000); // Longer timeout to ensure no new search happens right after selection
    } else {
      isDestinationSearching.current = true;
      setTimeout(() => {
        isDestinationSearching.current = false;
      }, 1000);
    }
    
    handleSelectAirport(airport, type);
  };

  return (
    <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="origin" className={styles.label}>From</label>
          <div className={styles.autocompleteContainer}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="origin"
                placeholder="City or Airport"
                value={originInput}
                onChange={handleOriginChange}
                className={`${styles.input} ${originLoading ? styles.inputLoading : ''}`}
                required
              />
              {originLoading && (
                <div className={styles.spinner}>
                  <div className={styles.spinnerIcon}></div>
                </div>
              )}
            </div>
            {originSearchResults.length > 0 && originInput.length >= 2 && !/^[A-Z]{3}$/.test(originInput) && (
              <ul className={styles.autocompleteResults}>
                {originSearchResults.map(airport => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => handleAirportSelection(airport, 'origin')}
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
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="destination"
                placeholder="City or Airport"
                value={destinationInput}
                onChange={handleDestinationChange}
                className={`${styles.input} ${destinationLoading ? styles.inputLoading : ''}`}
                required
              />
              {destinationLoading && (
                <div className={styles.spinner}>
                  <div className={styles.spinnerIcon}></div>
                </div>
              )}
            </div>
            {destinationSearchResults.length > 0 && destinationInput.length >= 2 && !/^[A-Z]{3}$/.test(destinationInput) && (
              <ul className={styles.autocompleteResults}>
                {destinationSearchResults.map(airport => (
                  <li 
                    key={airport.iataCode}
                    onClick={() => handleAirportSelection(airport, 'destination')}
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