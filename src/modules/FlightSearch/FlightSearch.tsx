import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmadeusApi } from '../../middleware/api/AmadeusApi';
import { Airport, FlightSearchParams } from '../../middleware/types';
import SearchForm from '../../components/SearchForm/SearchForm';
import styles from './FlightSearch.module.css';
import LogoImage from '../../assets/images/no_bg_color_full_logo.png';

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
    } catch (error) {
      console.error(`Error searching ${type} airports:`, error);
    }
  };

  const handleSelectAirport = (airport: Airport, type: 'origin' | 'destination') => {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prevParams => ({ ...prevParams, [name]: value }));
  };

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
        <img src={LogoImage} alt="Calido Viaje" className={styles.logo} />
        
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
      
      <div className={styles.illustration}>
        <div className={styles.blueSky}></div>
        <div className={styles.clouds}>
          <div className={styles.cloud}></div>
          <div className={styles.cloud}></div>
          <div className={styles.cloud}></div>
        </div>
        <div className={styles.plane}>
          <div className={styles.planeBody}></div>
          <div className={styles.planeNose}></div>
          <div className={styles.planeWing}></div>
          <div className={styles.planeWingBottom}></div>
          <div className={styles.planeTail}></div>
          <div className={styles.planeWindow}></div>
          <div className={styles.planeWindow}></div>
          <div className={styles.planeWindow}></div>
          <div className={styles.planeWindow}></div>
          <div className={styles.planeWindow}></div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;