import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaClock } from 'react-icons/fa';
import { AmadeusApi } from '../../middleware/api/AmadeusApi';
import { FlightOffer, FlightSearchParams } from '../../middleware/types';
import styles from './FlightResults.module.css';
import Loader from '../../components/ui/loader/Loader';
import { formattedShortDate, formatTime } from '../../helpers/date';
import { formatCurrency } from '../../helpers/currency';
import AirlineLogo from '../../components/AirlineLogo/AirlineLogo';

const FlightResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([]);
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  
  // Filters
  const [sortBy, setSortBy] = useState<string>('price');
  const [maxStops, setMaxStops] = useState<string>('any');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  
  useEffect(() => {
    if (!location.state?.searchParams) {
      navigate('/flights');
      return;
    }
    
    setSearchParams(location.state.searchParams);
    fetchFlights(location.state.searchParams);
  }, [location.state, navigate]);
  
  useEffect(() => {
    if (!flights.length) return;
    
    let filtered = [...flights];
    
    // Filter by stops
    if (maxStops !== 'any') {
      const maxStopsNum = parseInt(maxStops, 10);
      filtered = filtered.filter(flight => {
        const segments = flight.itineraries[0].segments;
        return segments.length <= maxStopsNum + 1; // +1 because segments = stops + 1
      });
    }
    
    // Filter by price
    filtered = filtered.filter(flight => {
      const price = parseFloat(flight.price.total);
      return price >= minPrice && price <= maxPrice;
    });
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price.total) - parseFloat(b.price.total);
        case 'duration':
          return a.itineraries[0].duration.localeCompare(b.itineraries[0].duration);
        case 'departure':
          return a.itineraries[0].segments[0].departure.at.localeCompare(
            b.itineraries[0].segments[0].departure.at
          );
        default:
          return 0;
      }
    });
    
    setFilteredFlights(filtered);
  }, [flights, sortBy, maxStops, minPrice, maxPrice]);
  
  const fetchFlights = async (params: FlightSearchParams) => {
    setLoading(true);
    try {
      const { data: offers, error } = await AmadeusApi.searchFlights(params);
      
      if (error) {
        throw error;
      }
      
      setFlights(offers || []);
      setFilteredFlights(offers || []);
      
      // Set price range based on available flights
      if (offers && offers.length > 0) {
        const prices = offers.map((offer: FlightOffer) => parseFloat(offer.price.total));
        setMinPrice(Math.floor(Math.min(...prices)));
        setMaxPrice(Math.ceil(Math.max(...prices)));
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectFlight = (flight: FlightOffer) => {
    navigate('/flight-details', { 
      state: { 
        flight, 
        searchParams 
      } 
    });
  };
  
  const getFlightDuration = (duration: string) => {
    // Convert PT2H30M format to 2h 30m
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    
    return `${hours ? hours[1] + 'h' : ''} ${minutes ? minutes[1] + 'm' : ''}`;
  };
  
  const getStopsLabel = (segments: any[]) => {
    const stopsCount = segments.length - 1;
    
    if (stopsCount === 0) return 'Nonstop';
    if (stopsCount === 1) return '1 stop';
    return `${stopsCount} stops`;
  };
  
  if (!searchParams) {
    return <Loader />;
  }
  
  return (
    <div className={styles.resultsContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Flight Results</h1>
        <Link to="/" className={styles.returnLink}>
          <FaArrowLeft /> Back to Search
        </Link>
      </div>
      
      <div className={styles.searchSummary}>
        <div className={styles.flightInfo}>
          <div className={styles.destination}>
            <span>{searchParams.originLocationCode}</span>
            <span className={styles.destinationDivider}>→</span>
            <span>{searchParams.destinationLocationCode}</span>
          </div>
          <div className={styles.dates}>
            {formattedShortDate(searchParams.departureDate)}
            {searchParams.returnDate && ` - ${formattedShortDate(searchParams.returnDate)}`}
          </div>
        </div>
        <div className={styles.details}>
          {searchParams.adults} {searchParams.adults === 1 ? 'Adult' : 'Adults'} · {searchParams.travelClass}
        </div>
      </div>
      
      <div className={styles.filterContainer}>
        <h3 className={styles.filterTitle}>Filter and Sort</h3>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="sortBy">Sort by:</label>
            <select 
              id="sortBy"
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="price">Price (Lowest first)</option>
              <option value="duration">Duration (Shortest first)</option>
              <option value="departure">Departure time (Earliest first)</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="maxStops">Stops:</label>
            <select 
              id="maxStops"
              className={styles.filterSelect}
              value={maxStops}
              onChange={(e) => setMaxStops(e.target.value)}
            >
              <option value="any">Any number of stops</option>
              <option value="0">Nonstop only</option>
              <option value="1">Max 1 stop</option>
              <option value="2">Max 2 stops</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className={styles.loadingResults}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Searching for the best flights...</p>
        </div>
      ) : (
        <>
          {filteredFlights.length > 0 ? (
            <div className={styles.flightsList}>
              {filteredFlights.map((flight, index) => {
                const departureSegment = flight.itineraries[0].segments[0];
                const arrivalSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
                const airline = flight.validatingAirlineCodes[0];
                
                return (
                  <div 
                    key={`${flight.id}-${index}`}
                    className={styles.flightCard}
                    onClick={() => handleSelectFlight(flight)}
                  >
                    <div className={styles.flightCardHeader}>
                      <div className={styles.airline}>
                        <AirlineLogo airlineCode={airline} size="medium" />
                        <span className={styles.airlineName}>{airline}</span>
                      </div>
                      <div className={styles.price}>
                        {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
                      </div>
                    </div>
                    
                    <div className={styles.flightCardBody}>
                      <div className={styles.flightTimes}>
                        <div className={styles.departureTime}>
                          {formatTime(departureSegment.departure.at)}
                        </div>
                        
                        <div className={styles.flightDuration}>
                          <div className={styles.durationLine}></div>
                          <span>{getFlightDuration(flight.itineraries[0].duration)}</span>
                        </div>
                        
                        <div className={styles.arrivalTime}>
                          {formatTime(arrivalSegment.arrival.at)}
                        </div>
                      </div>
                      
                      <div className={styles.flightDetails}>
                        <div className={styles.stops}>
                          <FaPlane className={styles.stopsIcon} />
                          <span>{getStopsLabel(flight.itineraries[0].segments)}</span>
                        </div>
                        <div className={styles.flightTime}>
                          <FaClock className={styles.timeIcon} /> 
                          {getFlightDuration(flight.itineraries[0].duration)}
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.flightCardFooter}>
                      <div className={styles.seatsLeft}>
                        {flight.numberOfBookableSeats > 5 
                          ? 'Plenty of seats available' 
                          : `Only ${flight.numberOfBookableSeats} seats left at this price`}
                      </div>
                      <button className={styles.selectButton}>
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.noResults}>
              <h3>No flights found for your search criteria</h3>
              <p>Try adjusting your filters or search again with different dates.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlightResults;