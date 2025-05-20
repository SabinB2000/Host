// src/components/VendorRoute.js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const VendorRoute = ({ user }) => {
  return user && user.role === "vendor" ? <Outlet /> : <Navigate to="/" replace />;
};

export default VendorRoute;
