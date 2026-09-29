import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={role === 'staff' ? '/staff/login' : '/student/login'} replace />;
  }

  if (role && userRole !== role) {
    // If authenticated but wrong role, redirect to appropriate dashboard
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
