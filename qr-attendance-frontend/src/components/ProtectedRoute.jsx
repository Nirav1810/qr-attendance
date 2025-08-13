import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Check for the token inside the component
  // This check runs every time you navigate to a protected route
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token is found, redirect the user to the login page
    return <Navigate to="/login" />;
  }

  // If a token is found, render the page content (the children)
  return children;
}

export default ProtectedRoute;