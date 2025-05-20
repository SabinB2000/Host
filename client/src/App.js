import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";

// Public Pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import About from "./pages/About";
import Vendors from "./pages/Vendors";
import Reviews from "./pages/Reviews";
import Explore from "./pages/Explore";
import Translation from "./pages/Translation";
import UserItineraryView from "./pages/UserItineraryView";
import ForgotPassword from "./pages/ForgotPassword";
import Recommendations from "./pages/Recommendations";
import Recommended from "./pages/Recommended";
import CategoryPlaces from "./components/CategoryPlaces";
import PlaceDetails from "./components/PlaceDetails";
import SavedPlaces from "./components/SavedPlaces";


// User (Protected) Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Itinerary from "./pages/Itinerary";
import Map from "./pages/Map";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManageUsers from "./pages/AdminManageUsers";
import AdminManagePlaces from "./pages/AdminManagePlaces";
import AdminManageItineraries from "./pages/AdminManageItineraries";
import AdminManageEvents from "./pages/AdminManageEvents";

// Vendor Pages
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorPlaces from "./pages/vendor/Places";
import AddPlace from "./pages/vendor/AddPlace";
import PlaceForm from "./pages/vendor/PlaceForm";
import ManageEvents from "./pages/vendor/ManageEvents";
import Settings from "./pages/vendor/Settings";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AuthForm from "./components/AuthForm";
import PrivateRoute from "./components/PrivateRoute";
import VendorRoute from "./components/VendorRoute";

import "./index.css";

export default function App() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith("/admin");
  const isVendorPath = location.pathname.startsWith("/vendor");

  const [showAuth, setShowAuth] = useState(false);

  // If a vendor is logged in but not on a vendor path, redirect
  useEffect(() => {
    if (user && user.role === "vendor" && !isVendorPath) {
      navigate("/vendor/dashboard", { replace: true });
    }
  }, [user, isVendorPath, navigate]);

  // Axios interceptor to handle 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          error.config.url.includes("/auth/profile/me")
        ) {
          console.warn("Unauthorized request to /auth/profile/me, logging out...");
          logout(); // Only logout if the critical /auth/profile/me endpoint fails
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <>
      {!user && !isAdmin && !isVendorPath && (
        <Navbar openAuth={() => setShowAuth(true)} />
      )}

      <div className="app-container">
        {user && !isAdmin && !isVendorPath && <Sidebar />}

        <div className="main-content">
          <Routes>
            {/* Protected User Routes */}
            <Route element={<PrivateRoute user={user} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/map" element={<Map />} />
              <Route path="/itinerary"element={<Navigate to="/itineraries" replace />} />
              <Route path="/profile/forgot-password" element={<ForgotPassword hideLoginLink={true} />} />
              <Route path="/recommended" element={<Recommended />} />
            </Route>

            {/* Protected Vendor Routes */}
            <Route path="/vendor/*" element={<VendorRoute user={user} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="places" element={<VendorPlaces />} />
              <Route path="places/new" element={<AddPlace />} />
              <Route path="places/:id/edit" element={<PlaceForm />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* new plural CRUD routes */}

            <Route path="/itineraries/:id/edit" element={<Itinerary />} />
            <Route path="/itineraries/new"      element={<Itinerary />} />
            <Route path="/itineraries"          element={<Itinerary />} />

            {/* Public Routes */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/translate" element={<Translation />} />
            <Route path="/itinerary" element={<Itinerary />} />

            <Route path="/itinerary/:id" element={<UserItineraryView />} />
            <Route path="/recommended" element={<Recommendations />} />
            <Route path="/explore/category/:category" element={<CategoryPlaces />} />
            <Route path="/explore/place/:placeId" element={<PlaceDetails />} />
            <Route path="/saved" element={<SavedPlaces />} />


            {/* Forgot-Password flows */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/profile/forgot-password"
              element={<ForgotPassword hideLoginLink={true} />}
            />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-manage-users" element={<AdminManageUsers />} />
            <Route path="/admin-manage-places" element={<AdminManagePlaces />} />
            <Route path="/admin-manage-itineraries" element={<AdminManageItineraries />} />
            <Route path="/admin-manage-events" element={<AdminManageEvents />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer style={{ textAlign: "center", padding: "10px", color: "#666" }}>
            Powered by Google
          </footer>
        </div>
      </div>

      {!user && !isAdmin && !isVendorPath && showAuth && (
        <AuthForm closeAuth={() => setShowAuth(false)} />
      )}
    </>
  );
}