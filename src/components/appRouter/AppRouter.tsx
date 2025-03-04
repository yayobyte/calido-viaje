import { Routes, Route } from 'react-router-dom';
import Invoices from '../../modules/Invoices/Invoices';
import Home from '../../modules/Home/Home';
import Login from '../../modules/Auth/Login';
import Register from '../../modules/Auth/Register';
import EmailVerification from '../../modules/Auth/EmailVerification';
import ProtectedRoute from '../../components/ProtectedRoute';

import styles from './AppRouter.module.css'


const AppRouter = () => {
    return (
        <main className={styles.main}>
          <div className={styles.content}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
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