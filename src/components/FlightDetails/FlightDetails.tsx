import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimes, FaPlane, FaClock } from 'react-icons/fa';
import { FlightOffer, FlightSearchParams } from '../../middleware/types';
import styles from './FlightDetails.module.css';
import { formattedDate, formatTime } from '../../helpers/date';
import { formatCurrency } from '../../helpers/currency';

const FlightDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, searchParams } = location.state as { 
    flight: FlightOffer; 
    searchParams: FlightSearchParams 
  };
  
  if (!flight) {
    navigate('/flights');
    return null;
  }
  
  const handleClose = () => {
    navigate(-1);
  };
  
  const getFlightDuration = (duration: string) => {
    // Convert PT2H30M format to 2h 30m
    const hours = duration.match(/(\d+)H/);
    const minutes = duration.match(/(\d+)M/);
    
    return `${hours ? hours[1] + 'h' : ''} ${minutes ? minutes[1] + 'm' : ''}`;
  };
  
  const getLayoverDuration = (arrivalTime: string, departureTime: string) => {
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const diffMs = departure.getTime() - arrival.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };
  
  const renderSegments = (itinerary: any) => {
    return (
      <div className={styles.timeline}>
        <div className={styles.timelineConnector}></div>
        
        {itinerary.segments.map((segment: any, index: number) => (
          <React.Fragment key={index}>
            {/* Departure */}
            <div className={styles.timelineEvent}>
              <div className={styles.timelinePoint}>
                <FaPlane className={styles.timelineIcon} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timeLabel}>
                  {formatTime(segment.departure.at)}
                </div>
                <div className={styles.locationLabel}>
                  {segment.departure.iataCode}
                </div>
                <div className={styles.airportInfo}>
                  {segment.departure.iataCode} Airport · {formattedDate(segment.departure.at)}
                </div>
                
                <div className={styles.flightInfo}>
                  <div className={styles.aircraft}>
                    <span className={styles.aircraftLabel}>Flight</span>
                    <span className={styles.aircraftValue}>{segment.carrierCode} {segment.number}</span>
                  </div>
                  <div className={styles.aircraft}>
                    <span className={styles.aircraftLabel}>Aircraft</span>
                    <span className={styles.aircraftValue}>{segment.aircraft?.code || 'N/A'}</span>
                  </div>
                  <div className={styles.aircraft}>
                    <span className={styles.aircraftLabel}>Duration</span>
                    <span className={styles.aircraftValue}>{getFlightDuration(segment.duration)}</span>
                  </div>
                  <div className={styles.aircraft}>
                    <span className={styles.aircraftLabel}>Class</span>
                    <span className={styles.aircraftValue}>{searchParams.travelClass}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Arrival */}
            <div className={styles.timelineEvent}>
              <div className={styles.timelinePoint}>
                <FaPlane className={styles.timelineIcon} style={{ transform: 'rotate(90deg)' }} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timeLabel}>
                  {formatTime(segment.arrival.at)}
                </div>
                <div className={styles.locationLabel}>
                  {segment.arrival.iataCode}
                </div>
                <div className={styles.airportInfo}>
                  {segment.arrival.iataCode} Airport · {formattedDate(segment.arrival.at)}
                </div>
              </div>
            </div>
            
            {/* Layover information if there's another segment */}
            {index < itinerary.segments.length - 1 && (
              <div className={styles.layoverInfo}>
                <FaClock />
                <span className={styles.layoverDuration}>
                  {getLayoverDuration(segment.arrival.at, itinerary.segments[index + 1].departure.at)} layover
                </span>
                <span className={styles.layoverLocation}>
                  in {segment.arrival.iataCode}
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.detailsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Flight Details</h2>
        <button className={styles.closeButton} onClick={handleClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className={styles.summary}>
        <div className={styles.routeSummary}>
          <div className={styles.route}>
            {flight.itineraries[0].segments[0].departure.iataCode} → {
              flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode
            }
          </div>
          <div className={styles.date}>
            {formattedDate(flight.itineraries[0].segments[0].departure.at)}
          </div>
        </div>
        <div className={styles.priceSummary}>
          <div className={styles.priceLabel}>Total Price</div>
          <div className={styles.price}>
            {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
          </div>
        </div>
      </div>
      
      <div className={styles.segment}>
        <div className={styles.segmentHeader}>
          <h3 className={styles.segmentTitle}>Outbound Flight</h3>
          <span className={styles.segmentType}>{searchParams.travelClass}</span>
        </div>
        
        {renderSegments(flight.itineraries[0])}
      </div>
      
      {flight.itineraries.length > 1 && (
        <div className={styles.segment}>
          <div className={styles.segmentHeader}>
            <h3 className={styles.segmentTitle}>Return Flight</h3>
            <span className={styles.segmentType}>{searchParams.travelClass}</span>
          </div>
          
          {renderSegments(flight.itineraries[1])}
        </div>
      )}
      
      <div className={styles.bookingDetails}>
        <h3 className={styles.bookingHeader}>Price Details</h3>
        
        <div className={styles.bookingInfo}>
          <div className={styles.bookingItem}>
            <span className={styles.bookingLabel}>Adult Fare x {searchParams.adults}</span>
            <span className={styles.bookingValue}>
              {formatCurrency(parseFloat(flight.price.base), flight.price.currency)}
            </span>
          </div>
          
          <div className={styles.bookingItem}>
            <span className={styles.bookingLabel}>Taxes & Fees</span>
            <span className={styles.bookingValue}>
              {formatCurrency(
                parseFloat(flight.price.total) - parseFloat(flight.price.base), 
                flight.price.currency
              )}
            </span>
          </div>
          
          <div className={styles.totalPrice}>
            <span>Total Price</span>
            <span>
              {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.backButton} onClick={handleClose}>
          Back to Results
        </button>
        <button className={styles.bookButton}>
          Book Now
        </button>
      </div>
    </div>
  );
};

export default FlightDetails;