import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaClock, FaExchangeAlt, FaChair, FaSuitcase, FaUsers } from 'react-icons/fa';
import { AmadeusApi } from '../../../middleware/api/AmadeusApi';
import { FlightOffer, FlightSearchParams, FlightSegment } from '../../../middleware/types';
import styles from './FlightResults.module.css';
import Loader from '../../../components/ui/loader/Loader';
import { formattedShortDate, formatTime } from '../../../helpers/date';
import { formatCurrency } from '../../../helpers/currency';
import AirlineLogo from '../../../components/AirlineLogo/AirlineLogo';

const FlightResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([]);
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [carrierDictionary, setCarrierDictionary] = useState<Record<string, string>>({});
  
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
      const { data: offers, error, dictionaries } = await AmadeusApi.searchFlights(params);
      
      if (error) {
        throw error;
      }
      
      setFlights(offers || []);
      setFilteredFlights(offers || []);
      
      // Store the carrier dictionary if available
      if (dictionaries && dictionaries.carriers) {
        setCarrierDictionary(dictionaries.carriers);
      }
      
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
  
  const getStopsLabel = (segments: FlightSegment[]) => {
    const stopsCount = segments.length - 1;
    
    if (stopsCount === 0) return 'Nonstop';
    if (stopsCount === 1) return '1 stop';
    return `${stopsCount} stops`;
  };
  
  // Helper to get carrier name from code
  const getCarrierName = (code: string) => {
    if (carrierDictionary[code]) {
      return carrierDictionary[code];
    }
    
    // Fallback to code if name not found
    return code;
  };

  // Helper function to get cabin class display name
  const getCabinDisplay = (cabin: string) => {
    switch(cabin.toUpperCase()) {
      case 'ECONOMY': return 'Economy';
      case 'PREMIUM_ECONOMY': return 'Premium Economy';
      case 'BUSINESS': return 'Business';
      case 'FIRST': return 'First';
      default: return cabin;
    }
  };

  // Helper function to get baggage allowance info
  const getBaggageInfo = (flight: FlightOffer) => {
    if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
      return { checkedBags: 0, cabinBags: 0 };
    }
  
    // Get the first segment's baggage info from the first traveler
    const firstTraveler = flight.travelerPricings[0];
    const firstSegment = firstTraveler.fareDetailsBySegment?.[0];
    
    if (!firstSegment) {
      return { checkedBags: 0, cabinBags: 0 };
    }
  
    const checkedBags = firstSegment.includedCheckedBags?.quantity || 0;
    const cabinBags = firstSegment.includedCabinBags?.quantity || 0;
  
    return { checkedBags, cabinBags };
  };
  
  // Get cabin class info
  const getCabinInfo = (flight: FlightOffer) => {
    if (!flight.travelerPricings || flight.travelerPricings.length === 0) {
      return { cabin: 'ECONOMY', brandedFare: '' };
    }
  
    // Get the first segment's cabin info from the first traveler
    const firstTraveler = flight.travelerPricings[0];
    const firstSegment = firstTraveler.fareDetailsBySegment?.[0];
    
    if (!firstSegment) {
      return { cabin: 'ECONOMY', brandedFare: '' };
    }
  
    return { 
      cabin: firstSegment.cabin || 'ECONOMY',
      brandedFare: firstSegment.brandedFareLabel || ''
    };
  };

  if (!searchParams) {
    return <Loader />;
  }
  
  // Helper function to render a flight itinerary
  const renderItinerary = (flight: FlightOffer, itineraryIndex: number, isReturn: boolean) => {
    const itinerary = flight.itineraries[itineraryIndex];
    const departureSegment = itinerary.segments[0];
    const arrivalSegment = itinerary.segments[itinerary.segments.length - 1];
    
    return (
      <div className={`${styles.itinerarySection} ${isReturn ? styles.returnItinerary : ''}`}>
        {isReturn && (
          <div className={styles.itineraryLabel}>
            <FaExchangeAlt className={styles.returnIcon} /> Return Flight
          </div>
        )}
        <div className={styles.flightCardBody}>
          <div className={styles.flightTimes}>
            <div className={styles.departureTime}>
              {formatTime(departureSegment.departure.at)}
              <div className={styles.airportCode}>{departureSegment.departure.iataCode}</div>
            </div>
            
            <div className={styles.flightDuration}>
              <div className={styles.durationLine}></div>
              <span>{getFlightDuration(itinerary.duration)}</span>
            </div>
            
            <div className={styles.arrivalTime}>
              {formatTime(arrivalSegment.arrival.at)}
              <div className={styles.airportCode}>{arrivalSegment.arrival.iataCode}</div>
            </div>
          </div>
          
          <div className={styles.flightDetails}>
            <div className={styles.stops}>
              <FaPlane className={styles.stopsIcon} />
              <span>{getStopsLabel(itinerary.segments)}</span>
            </div>
            <div className={styles.flightTime}>
              <FaClock className={styles.timeIcon} /> 
              {getFlightDuration(itinerary.duration)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
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
                const airline = flight.validatingAirlineCodes[0];
                const isRoundTrip = flight.itineraries.length > 1;
                
                return (
                  <div 
                    key={`${flight.id}-${index}`}
                    className={styles.flightCard}
                    onClick={() => handleSelectFlight(flight)}
                  >
                    <div className={styles.flightCardHeader}>
                      <div className={styles.airline}>
                        <AirlineLogo airlineCode={airline} size="medium" />
                        <span className={styles.airlineName}>
                          {getCarrierName(airline)}
                        </span>
                      </div>
                      <div className={styles.price}>
                        {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
                      </div>
                    </div>
                    
                    {/* Outbound flight - always present */}
                    {renderItinerary(flight, 0, false)}
                    
                    {/* Return flight - only if it's a round trip */}
                    {isRoundTrip && renderItinerary(flight, 1, true)}

                    {/* Flight details section */}
                    <div className={styles.flightDetails}>

                      {/* Baggage info */}
                      {(() => {
                        const { checkedBags, cabinBags } = getBaggageInfo(flight);
                        return (
                          <div className={styles.baggageDetail}>
                            <div className={styles.detailIcon}>
                              <FaSuitcase />
                            </div>
                            <div className={styles.detailContent}>
                              <div className={styles.detailLabel}>Baggage</div>
                              <div className={styles.detailValue}>
                                {checkedBags > 0 ? (
                                  <span>{checkedBags} checked {checkedBags === 1 ? 'bag' : 'bags'}</span>
                                ) : (
                                  <span className={styles.noBags}>No checked bags</span>
                                )}
                                {cabinBags > 0 && (
                                  <span className={styles.cabinBags}>
                                    {" + " + cabinBags} cabin {cabinBags === 1 ? 'bag' : 'bags'}
                                  </span>
                                )}
                              </div>
                              {flight.price.additionalServices && flight.price.additionalServices.some(service => 
                                service.type === "CHECKED_BAGS" && parseFloat(service.amount) > 0) && (
                                <span className={styles.baggageFee}>
                                  (+{formatCurrency(parseFloat(flight.price.additionalServices.find(
                                    service => service.type === "CHECKED_BAGS"
                                  )?.amount || "0"), flight.price.currency)} for bags)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Cabin info */}
                      {(() => {
                        const { cabin, brandedFare } = getCabinInfo(flight);
                        return (
                          <div className={styles.flightDetailItem}>
                            <div className={styles.detailIcon}>
                              <FaChair />
                            </div>
                            <div className={styles.detailContent}>
                              <div className={styles.detailLabel}>Cabin</div>
                              <div className={styles.detailValue}>
                                {getCabinDisplay(cabin)}
                                {brandedFare && <span className={styles.brandedFare}> ({brandedFare})</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Seats available */}
                      <div className={styles.flightDetailItem}>
                        <div className={styles.detailIcon}>
                          <FaUsers />
                        </div>
                        <div className={styles.detailContent}>
                          <div className={styles.detailLabel}>Availability</div>
                          <div className={styles.detailValue}>
                            {flight.numberOfBookableSeats > 5 
                              ? 'Plenty of seats' 
                              : `Only ${flight.numberOfBookableSeats} seats left`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.flightCardFooter}>
                      {/* Show price details - base + taxes/fees */}
                      <div className={styles.priceDetails}>
                        <div className={styles.totalPrice}>
                          {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
                        </div>
                        <div className={styles.priceBreakdown}>
                          {parseFloat(flight.price.base) > 0 && 
                            <span>Base: {formatCurrency(parseFloat(flight.price.base), flight.price.currency)}</span>}
                        </div>
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