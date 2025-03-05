import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.css';

interface LinkButtonProps {
  children: React.ReactNode;
  to: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  to,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  icon,
  onClick
}) => {
  const linkClasses = [
    styles.linkButton,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Link
      to={to}
      className={linkClasses}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </Link>
  );
};

export default LinkButton;