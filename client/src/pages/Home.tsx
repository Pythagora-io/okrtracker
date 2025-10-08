import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../../shared/types/user';
import { useAuth } from '@/contexts/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const userRole = currentUser.role as UserRole || UserRole.IC;

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
  }, [navigate, currentUser]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};