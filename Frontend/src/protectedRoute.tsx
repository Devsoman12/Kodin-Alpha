import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './context/AuthContext'; // Import your Zustand store

interface ProtectedRouteProps {
  children: ReactNode; // children can be any React node (JSX, string, number, etc.)
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  console.log(user)
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if(!user?.isverified){
    return <Navigate to='/register2fa' replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
