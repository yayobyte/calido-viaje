import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { useAuth } from '../../context/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Account Not Authorized</h1>
        
        <div className={styles.messageBox}>
          <p>Your account is awaiting authorization by an administrator.</p>
          <p>Please check back later or contact support for assistance.</p>
        </div>
        
        <div className={styles.buttonContainer}>
          <Link to="/" className={styles.linkButton}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;