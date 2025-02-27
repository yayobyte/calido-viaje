import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigator.module.css';
import logoSvg from '../../../assets/images/symbol.svg';

const Navigator: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logoSvg} alt="Calido Viaje" className={styles.logoImage} />
          </Link>
        </div>
        <div className={styles.links}>
          <Link 
            className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`} 
            to="/"
          >
            Home
          </Link>
          <Link 
            className={`${styles.link} ${location.pathname === '/invoices' ? styles.active : ''}`} 
            to="/invoices"
          >
            Invoices
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navigator;