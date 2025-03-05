import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import { useAuth } from '../../context/AuthContext';
import { UserApi } from '../../middleware/api/UserApi';
import Loader from '../../components/ui/loader/Loader';
import { FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Button from '../../components/UI/Button/Button';

const SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL;

interface UserListItem {
  id: string;
  email: string;
  full_name: string;
  is_authorized: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { users: userList, error } = await UserApi.getAllUsers();
      
      if (error) {
        setError(error.message);
      } else if (userList) {
        setUsers(userList);
      }
      
      setLoading(false);
    };
    
    fetchUsers();
  }, []);
  
  const handleToggleAuthorization = async (userId: string, currentStatus: boolean) => {
    setActionInProgress(userId);
    
    const { success, error } = await UserApi.setUserAuthorization(
      userId, 
      !currentStatus
    );
    
    if (success) {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_authorized: !currentStatus } 
          : user
      ));
    } else if (error) {
      setError(error.message);
    }
    
    setActionInProgress(null);
  };
  
  // Only admin can access this page
  if (user?.email !== SUPERADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <div className={styles.container}>
      <h1>User Management</h1>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      {/* Desktop Table View (hidden on mobile) */}
      <div className={styles.desktopTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={user.is_authorized ? styles.authorized : styles.unauthorized}>
                    {user.is_authorized ? (
                      <>
                        <FaCheckCircle style={{ marginRight: '4px' }} /> Authorized
                      </>
                    ) : (
                      <>
                        <FaTimesCircle style={{ marginRight: '4px' }} /> Unauthorized
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <Button 
                    variant={user.is_authorized ? "danger" : "success"}
                    size="small"
                    onClick={() => handleToggleAuthorization(user.id, user.is_authorized)}
                    disabled={actionInProgress === user.id}
                    className={styles.actionButton}
                  >
                    {actionInProgress === user.id 
                      ? 'Processing...' 
                      : user.is_authorized 
                        ? 'Revoke Access' 
                        : 'Authorize'}
                  </Button>
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobile Card View (hidden on desktop) */}
      <div className={styles.mobileCardList}>
        {users.length === 0 ? (
          <div className={styles.noDataCard}>No users found</div>
        ) : (
          users.map(user => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.userName}>{user.full_name}</h3>
                <span className={user.is_authorized ? styles.statusBadgeAuthorized : styles.statusBadgeUnauthorized}>
                  {user.is_authorized ? 
                    <><FaCheckCircle className={styles.statusIcon} /> Authorized</> : 
                    <><FaTimesCircle className={styles.statusIcon} /> Unauthorized</>
                  }
                </span>
              </div>
              
              <div className={styles.cardDetails}>
                <div className={styles.detailItem}>
                  <FaEnvelope className={styles.detailIcon} />
                  <span>{user.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.detailIcon} />
                  <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className={styles.cardActions}>
                <Button 
                  variant={user.is_authorized ? "danger" : "success"}
                  size="medium"
                  fullWidth={true}
                  onClick={() => handleToggleAuthorization(user.id, user.is_authorized)}
                  disabled={actionInProgress === user.id}
                >
                  {actionInProgress === user.id 
                    ? 'Processing...' 
                    : user.is_authorized 
                      ? 'Revoke Access' 
                      : 'Authorize'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;