import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './Admin.module.css';
import { useAuth } from '../../context/AuthContext';
import { UserApi } from '../../middleware/api/UserApi';
import Loader from '../../components/ui/loader/Loader';
import { FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Button from '../../components/ui/Button/Button';
import Table from '../../components/ui/table/Table';

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
  
  // Define table columns
  const columns = [
    {
      header: 'Name',
      key: 'full_name',
      mobilePriority: 1
    },
    {
      header: 'Email',
      key: 'email',
      mobilePriority: 2,
      mobileRender: (item: UserListItem) => (
        <div className={styles.detailItem}>
          <FaEnvelope className={styles.detailIcon} />
          <span>{item.email}</span>
        </div>
      )
    },
    {
      header: 'Created',
      key: 'created_at',
      render: (item: UserListItem) => new Date(item.created_at).toLocaleDateString(),
      mobilePriority: 3,
      mobileRender: (item: UserListItem) => (
        <div className={styles.detailItem}>
          <FaCalendarAlt className={styles.detailIcon} />
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'is_authorized',
      render: (item: UserListItem) => (
        <span className={item.is_authorized ? styles.authorized : styles.unauthorized}>
          {item.is_authorized ? (
            <>
              <FaCheckCircle style={{ marginRight: '4px' }} /> Authorized
            </>
          ) : (
            <>
              <FaTimesCircle style={{ marginRight: '4px' }} /> Unauthorized
            </>
          )}
        </span>
      ),
      mobilePriority: 0
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (item: UserListItem) => (
        <Button 
          variant={item.is_authorized ? "danger" : "success"}
          size="small"
          onClick={() => handleToggleAuthorization(item.id, item.is_authorized)}
          disabled={actionInProgress === item.id}
          className={styles.actionButton}
        >
          {actionInProgress === item.id 
            ? 'Processing...' 
            : item.is_authorized 
              ? 'Revoke Access' 
              : 'Authorize'}
        </Button>
      ),
      mobilePriority: 999 // Don't show in mobile content section
    }
  ];

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
      
      <Table 
        data={users}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="No users found"
        cardTitleKey="full_name"
        cardStatusBadge={(item) => (
          <span className={item.is_authorized ? styles.statusBadgeAuthorized : styles.statusBadgeUnauthorized}>
            {item.is_authorized ? 
              <><FaCheckCircle className={styles.statusIcon} /> Authorized</> : 
              <><FaTimesCircle className={styles.statusIcon} /> Unauthorized</>
            }
          </span>
        )}
        cardActions={(item) => (
          <Button 
            variant={item.is_authorized ? "danger" : "success"}
            size="medium"
            fullWidth={true}
            onClick={() => handleToggleAuthorization(item.id, item.is_authorized)}
            disabled={actionInProgress === item.id}
          >
            {actionInProgress === item.id 
              ? 'Processing...' 
              : item.is_authorized 
                ? 'Revoke Access' 
                : 'Authorize'}
          </Button>
        )}
      />
    </div>
  );
};

export default UserManagement;