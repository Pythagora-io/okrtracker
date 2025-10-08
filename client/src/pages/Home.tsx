import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../shared/types/user';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole') as UserRole || UserRole.IC;

    switch (userRole) {
      case UserRole.ADMIN:
        navigate('/admin/users');
        break;
      case UserRole.MANAGER:
        navigate('/manager/teams');
        break;
      case UserRole.IC:
        navigate('/ic/goals');
        break;
      default:
        navigate('/ic/goals');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};