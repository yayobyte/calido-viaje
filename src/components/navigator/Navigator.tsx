import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigator.module.css';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/symbol.svg';

const Navigator: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} alt="Calido Viaje" className={styles.logoImage} />
          </Link>
        </div>
        
        <div className={styles.links}>
          <Link 
            className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`} 
            to="/"
          >
            Home
          </Link>
          
          {user && (
            <Link 
              className={`${styles.link} ${location.pathname === '/invoices' ? styles.active : ''}`} 
              to="/invoices"
            >
              Invoices
            </Link>
          )}
          
          {!user ? (
            <Link 
              className={`${styles.link} ${location.pathname === '/login' ? styles.active : ''}`} 
              to="/login"
            >
              Login
            </Link>
          ) : (
            <div className={styles.userMenu}>
              <button className={styles.userButton}>
                {user.user_metadata?.full_name || user.email}
              </button>
              <div className={styles.userDropdown}>
                <Link
                  className={styles.manageUsersLink}
                  to='/admin/users'
                >
                  Manage Users
                </Link>
                <button 
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigator;