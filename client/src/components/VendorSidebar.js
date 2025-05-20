import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosConfig";
import "../styles/VendorSidebar.css";

import { useAuth } from "../contexts/AuthContext";  // <-- import useAuth

export default function VendorSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({});
  const { logout } = useAuth();                      // <-- get logout
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance
      .get("/vendor/dashboard")
      .then((res) => setStats((prev) => ({ ...prev, ...res.data })))
      .catch((err) => {
        console.error("Vendor dashboard error:", err);
      });
  }, []);

  const handleLogout = () => {
    logout();                                       // <-- call context logout
    Swal.fire("Success", "Logged out successfully", "success");
    navigate("/", { replace: true });
  };

  return (
    <div className={`vs-container ${collapsed ? "collapsed" : ""}`}>
      {/* toggle button */}
      <button className="vs-toggle" onClick={() => setCollapsed(c => !c)}>
        {collapsed ? "▶" : "◀"}
      </button>

      <div className="vs-links">
        <NavLink
          to="/vendor/dashboard"
          end                             // ← exact match
          className={({ isActive }) =>
            isActive ? "vs-link active" : "vs-link"
          }
        >
          <span className="vs-icon">🏠</span>
          <span className="vs-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/vendor/places"
          end                             // ← exact match
          className={({ isActive }) =>
            isActive ? "vs-link active" : "vs-link"
          }
        >
          <span className="vs-icon">📍</span>
          <span className="vs-text">Manage Places</span>
        </NavLink>

        <NavLink
          to="/vendor/places/new"
          className={({ isActive }) =>
            isActive ? "vs-link active" : "vs-link"
          }
        >
          <span className="vs-icon">➕</span>
          <span className="vs-text">Add New</span>
        </NavLink>

        <NavLink
          to="/vendor/events"
          end
          className={({ isActive }) =>
            isActive ? "vs-link active" : "vs-link"
          }
        >
          <span className="vs-icon">🎉</span>
          <span className="vs-text">Manage Events</span>
        </NavLink>

        <NavLink
          to="/vendor/settings"
          end
          className={({ isActive }) =>
            isActive ? "vs-link active" : "vs-link"
          }
        >
          <span className="vs-icon">⚙️</span>
          <span className="vs-text">Settings</span>
        </NavLink>
      </div>

      <button className="vs-logout" onClick={handleLogout}>
        <span className="vs-icon">🚪</span>
        <span className="vs-text">Log Out</span>
      </button>
    </div>
  );
}
