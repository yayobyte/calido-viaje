import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigator.module.css';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaTimes, FaHome, FaFileInvoiceDollar, FaUser, FaUserCog } from 'react-icons/fa';
import { RiLogoutBoxRLine } from 'react-icons/ri';
import LogoImage from '../../assets/images/no_bg_color_full_logo.png';
import LinkButton from '../ui/LinkButton/LinkButton';
import Button from '../ui/Button/Button';

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
            <img src={LogoImage} alt="Calido Viaje" className={styles.logoImage} />
          </Link>
        </div>
        
        <button 
          className={`${styles.mobileMenuButton} ${menuOpen ? styles.mobileMenuActive : ''}`} 
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className={`${styles.links} ${menuOpen ? styles.active : ''}`}>
          <LinkButton 
            to="/" 
            variant={location.pathname === '/' ? 'secondary' : 'text'} 
            size="small" 
            icon={<FaHome />}
            onClick={closeMenu}
            className={styles.navLink}
          >
            Home
          </LinkButton>
          
          {user && (
            <LinkButton 
              to="/invoices" 
              variant={location.pathname === '/invoices' ? 'secondary' : 'text'} 
              size="small" 
              icon={<FaFileInvoiceDollar />}
              onClick={closeMenu}
              className={`${styles.navLink} ${location.pathname === '/invoices' ? styles.activeLink : ''}`}
            >
              Invoices
            </LinkButton>
          )}
          
          {!user ? (
            <LinkButton 
              to="/login" 
              variant={location.pathname === '/login' ? 'secondary' : 'text'} 
              size="small" 
              icon={<FaUser />}
              onClick={closeMenu}
              className={`${styles.navLink} ${location.pathname === '/login' ? styles.activeLink : ''}`}
            >
              Login
            </LinkButton>
          ) : (
            <div className={styles.userMenu}>
              <Button 
                variant="primary" 
                size="small" 
                icon={<FaUser />}
                className={styles.userNavButton}
              >
                {user.user_metadata?.full_name || user.email}
              </Button>
              <div className={styles.userDropdown}>
                <LinkButton
                  to="/admin/users"
                  variant="text"
                  size="small"
                  icon={<FaUserCog />}
                  onClick={closeMenu}
                  className={styles.dropdownLink}
                >
                  Manage Users
                </LinkButton>
                <Button
                  onClick={handleLogout}
                  variant="text"
                  size="small"
                  icon={<RiLogoutBoxRLine />}
                  className={styles.dropdownLink}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navigator;