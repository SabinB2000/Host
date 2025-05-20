// src/components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  // If there's no token or role is not admin, redirect to admin login page.
  if (!token || role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

export default AdminRoute;
    