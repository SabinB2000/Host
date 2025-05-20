// src/pages/UserDashboard.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import "../styles/UserDashboard.css"; // We'll create this file next

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axiosInstance.get(`${API_URL}/dashboard`);
        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to load dashboard data.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading-screen">Loading Dashboard...</div>;
  if (!dashboardData) return <div className="error-screen">No dashboard data found.</div>;

  const { user, activityHistory, recommendations, settings } = dashboardData;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
      </div>

      <div className="dashboard-section">
        <h2>Your Activity History</h2>
        <ul>
          {activityHistory.map((activity) => (
            <li key={activity.id}>{activity.type}: {activity.details}</li>
          ))}
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Recommendations</h2>
        <ul>
          {recommendations.map((rec) => (
            <li key={rec.id}>{rec.title}</li>
          ))}
        </ul>
      </div>

      <div className="dashboard-section">
        <h2>Settings</h2>
        <p>Notifications: {settings.notifications ? "On" : "Off"}</p>
        <p>Theme: {settings.theme}</p>
        <p>Language: {settings.language}</p>
      </div>

      <div className="dashboard-section">
        <h2>Help & Support</h2>
        <p>If you have any questions, please visit our FAQ or contact support at support@guidenepal.com</p>
      </div>
    </div>
  );
};

export default UserDashboard;
