import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type Props = {
  children: React.ReactElement;
};

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  // Read token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    // Redirect to sign-in, preserve current location
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
}
