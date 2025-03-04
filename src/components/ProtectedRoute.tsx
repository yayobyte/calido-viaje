import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './ui/loader/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isVerified } = useAuth();
  
  if (loading) {
    return <Loader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;