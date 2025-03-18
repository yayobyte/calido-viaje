// components/AirlineLogo.tsx
import React, { useState } from 'react';
import styles from './AirlineLogo.module.css';

interface AirlineLogoProps {
  airlineCode: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const AirlineLogo: React.FC<AirlineLogoProps> = ({ 
  airlineCode, 
  size = 'medium', 
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeMap = {
    small: '24px',
    medium: '36px',
    large: '48px'
  };

  const style = {
    width: sizeMap[size],
    height: sizeMap[size]
  };

  if (hasError) {
    return (
      <div 
        className={`${styles.fallbackLogo} ${className}`} 
        style={style}
        title={airlineCode}
      >
        {airlineCode.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://www.gstatic.com/flights/airline_logos/70px/${airlineCode}.png`}
      alt={airlineCode}
      className={`${styles.airlineLogo} ${className}`}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};

export default AirlineLogo;