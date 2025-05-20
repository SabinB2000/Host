// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate }                  from 'react-router-dom';
import axiosInstance                    from '../utils/axiosConfig';
import AdminSidebar                     from '../components/AdminSidebar';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  // UI state
  const [stats, setStats]       = useState({
    totalUsers: 0,
    totalPlaces: 0,
    totalItineraries: 0,
    totalEvents: 0,
  });
  const [error, setError]       = useState('');
  const [isLoading, setLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);

  const navigate = useNavigate();

  // Log the admin out
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/admin-login');
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // you already guard at the API level, but just in case:
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No admin token found. Please log in.');

        // GET /api/admin/stats should return { users, places, itineraries, events }
        const res = await axiosInstance.get('/admin/stats');
        const { users, places, itineraries, events } = res.data;

        // map into your UI state
        setStats({
          totalUsers:       users,
          totalPlaces:      places,
          totalItineraries: itineraries,
          totalEvents:      events,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message || 'Unable to fetch statistics. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar 
        onLogout={handleLogout} 
        onWidthChange={setSidebarWidth} 
      />
      <div 
        className="admin-dashboard-content"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p className="welcome-text">
              Welcome back! Here's an overview of your platform statistics.
            </p>
          </header>

          {error && (
            <div className="error-alert">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card user-stat">
                  <div className="stat-icon">👥</div>
                  <h3>Total Users</h3>
                  <p className="stat-value">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                  <p className="stat-description">Registered accounts</p>
                </div>
                
                <div className="stat-card place-stat">
                  <div className="stat-icon">🗺️</div>
                  <h3>Total Places</h3>
                  <p className="stat-value">
                    {stats.totalPlaces.toLocaleString()}
                  </p>
                  <p className="stat-description">Locations in database</p>
                </div>
                
                <div className="stat-card itinerary-stat">
                  <div className="stat-icon">📅</div>
                  <h3>Total Itineraries</h3>
                  <p className="stat-value">
                    {stats.totalItineraries.toLocaleString()}
                  </p>
                  <p className="stat-description">Trip plans created</p>
                </div>
                
                <div className="stat-card event-stat">
                  <div className="stat-icon">🎫</div>
                  <h3>Total Events</h3>
                  <p className="stat-value">
                    {stats.totalEvents.toLocaleString()}
                  </p>
                  <p className="stat-description">Upcoming events</p>
                </div>
              </div>

              <section className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button 
                    className="action-btn manage-users"
                    onClick={() => navigate('/admin-manage-users')}
                  >
                    <span className="btn-icon">👥</span>
                    <span>Manage Users</span>
                  </button>
                  
                  <button 
                    className="action-btn manage-places"
                    onClick={() => navigate('/admin-manage-places')}
                  >
                    <span className="btn-icon">🗺️</span>
                    <span>Manage Places</span>
                  </button>
                  
                  <button 
                    className="action-btn manage-itineraries"
                    onClick={() => navigate('/admin-manage-itineraries')}
                  >
                    <span className="btn-icon">📅</span>
                    <span>Manage Itineraries</span>
                  </button>
                  
                  <button 
                    className="action-btn manage-events"
                    onClick={() => navigate('/admin-manage-events')}
                  >
                    <span className="btn-icon">🎫</span>
                    <span>Manage Events</span>
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
