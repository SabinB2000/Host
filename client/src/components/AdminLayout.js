
import React from 'react';
import AdminSidebar from './AdminSidebar';
import '../styles/adminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
};

export default AdminLayout;
