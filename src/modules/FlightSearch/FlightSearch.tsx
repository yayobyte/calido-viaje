import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmadeusApi } from '../../middleware/api/AmadeusApi';
import { Airport, FlightSearchParams } from '../../middleware/types';
import SearchForm from '../../components/SearchForm/SearchForm';
import styles from './FlightSearch.module.css';

const FlightSearch: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [originSearchResults, setOriginSearchResults] = useState<Airport[]>([]);
  const [destinationSearchResults, setDestinationSearchResults] = useState<Airport[]>([]);
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    originLocationCode: '',
    destinationLocationCode: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    travelClass: 'ECONOMY',
    currencyCode: 'USD'
  });

  const handleAirportSearch = async (keyword: string, type: 'origin' | 'destination') => {
    if (keyword.length < 2) {
      if (type === 'origin') {
        setOriginSearchResults([]);
      } else {
        setDestinationSearchResults([]);
      }
      return;
    }

    try {
      const response = await AmadeusApi.searchAirports(keyword);
      
      if (response.error) {
        console.error('Error searching airports:', response.error);
        return;
      }

      if (type === 'origin') {
        setOriginSearchResults(response.data);
      } else {
        setDestinationSearchResults(response.data);
      }
      console.log(response.data)
    } catch (error) {
      console.error(`Error searching ${type} airports:`, error);
    }
  };

  const handleSelectAirport = useCallback((airport: Airport, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setSearchParams(prevParams => ({ 
        ...prevParams, 
        originLocationCode: airport.iataCode 
      }));
      setOriginSearchResults([]);
    } else {
      setSearchParams(prevParams => ({ 
        ...prevParams, 
        destinationLocationCode: airport.iataCode 
      }));
      setDestinationSearchResults([]);
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({ ...prevParams, [name]: value }));
  },[])

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Navigate to results page with search params
      navigate('/flights/results', { 
        state: { searchParams }
      });
    } catch (error) {
      console.error('Error during flight search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.flightSearchContainer}>
      <div className={styles.searchPanel}>
        <h1 className={styles.title}>Find Your Perfect Flight</h1>
        
        <div className={styles.formContainer}>
          <SearchForm 
            searchParams={searchParams}
            handleInputChange={handleInputChange}
            handleAirportSearch={handleAirportSearch}
            handleSelectAirport={handleSelectAirport}
            originSearchResults={originSearchResults}
            destinationSearchResults={destinationSearchResults}
            handleSearchSubmit={handleSearchSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;