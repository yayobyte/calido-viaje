import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { useAuth } from '../../context/AuthContext';

const EmailVerification: React.FC = () => {
  const { user, isVerified, resendVerificationEmail } = useAuth();
  const [resendStatus, setResendStatus] = useState<{
    sending: boolean;
    sent: boolean;
    error?: string;
  }>({
    sending: false,
    sent: false,
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isVerified) {
    return <Navigate to="/" replace />;
  }

  const handleResendEmail = async () => {
    setResendStatus({ sending: true, sent: false });
    
    const { success, error } = await resendVerificationEmail();
    
    if (success) {
      setResendStatus({
        sending: false,
        sent: true,
      });
    } else {
      setResendStatus({
        sending: false,
        sent: false,
        error,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>Verify Your Email</h1>
        
        <div className={styles.messageBox}>
          <p>Please verify your email address to access all features.</p>
          <p>We've sent a verification link to: <strong>{user.email}</strong></p>
        </div>
        
        {resendStatus.sent && (
          <div className={styles.successMessage}>
            Verification email sent! Check your inbox.
          </div>
        )}
        
        {resendStatus.error && (
          <div className={styles.error}>
            {resendStatus.error}
          </div>
        )}
        
        <button 
          className={styles.submitButton} 
          onClick={handleResendEmail}
          disabled={resendStatus.sending}
        >
          {resendStatus.sending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;