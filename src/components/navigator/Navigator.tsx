import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigator.module.css';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/symbol.svg';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navigator: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Calido Viaje" className={styles.logoImage} />
          </Link>
        </div>
        
        <button className={styles.mobileMenuButton} onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className={`${styles.links} ${menuOpen ? styles.active : ''}`}>
          <Link 
            className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`} 
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>
          
          {user && (
            <Link 
              className={`${styles.link} ${location.pathname === '/invoices' ? styles.active : ''}`} 
              to="/invoices"
              onClick={closeMenu}
            >
              Invoices
            </Link>
          )}
          
          {!user ? (
            <Link 
              className={`${styles.link} ${location.pathname === '/login' ? styles.active : ''}`} 
              to="/login"
              onClick={closeMenu}
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
                  onClick={closeMenu}
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