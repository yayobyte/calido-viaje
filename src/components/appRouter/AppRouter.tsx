import { Routes, Route } from 'react-router-dom';
import Invoices from '../../modules/Invoices/Invoices';
import Login from '../../modules/Auth/Login';
import Register from '../../modules/Auth/Register';
import EmailVerification from '../../modules/Auth/EmailVerification';
import ProtectedRoute from '../../components/ProtectedRoute';

import styles from './AppRouter.module.css'
import UserManagement from '../../modules/Admin/UserManagement';
import Unauthorized from '../../modules/Auth/Unauthorized';
import FlightSearch from '../../modules/FlightSearch/FlightSearch';
import FlightResults from '../../modules/FlightResults/FlightResults';


const AppRouter = () => {
    return (
        <main className={styles.main}>
          <div className={styles.content}>
            <Routes>
              <Route path="/" element={<FlightSearch />} />
              <Route path="/flights/results" element={<FlightResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path='/unauthorized' element={<Unauthorized />} />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/invoices" 
                element={
                  <ProtectedRoute>
                    <Invoices />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </main>
    )
}

export default AppRouter