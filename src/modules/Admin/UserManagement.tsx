import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import { useAuth } from '../../context/AuthContext';
import { UserApi } from '../../middleware/api/UserApi';
import Loader from '../../components/ui/loader/Loader';

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
      
      <div className={styles.tableContainer}>
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
                  {user.is_authorized ? 'Authorized' : 'Unauthorized'}
                </span>
              </td>
              <td>
                <button 
                  className={user.is_authorized ? styles.dangerButton : styles.successButton}
                  onClick={() => handleToggleAuthorization(user.id, user.is_authorized)}
                  disabled={actionInProgress === user.id}
                >
                  {actionInProgress === user.id 
                    ? 'Processing...' 
                    : user.is_authorized 
                      ? 'Revoke Access' 
                      : 'Authorize'}
                </button>
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
    </div>
  );
};

export default UserManagement;