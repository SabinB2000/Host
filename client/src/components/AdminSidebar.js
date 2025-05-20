import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUserCog,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "../styles/AdminSidebar.css";

// ← import your auth hook
import { useAuth } from "../contexts/AuthContext";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location        = useLocation();
  const { logout }      = useAuth();            // ← grab logout

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && <h3>Admin Panel</h3>}
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive("/admin-dashboard") ? "active" : ""}>
          <Link to="/admin-dashboard">
            <FaUserCog />
            {!collapsed && <span> Dashboard</span>}
          </Link>
        </li>
        <li className={isActive("/admin-manage-users") ? "active" : ""}>
          <Link to="/admin-manage-users">
            <FaUser />
            {!collapsed && <span> Manage Users</span>}
          </Link>
        </li>
        <li className={isActive("/admin-manage-places") ? "active" : ""}>
          <Link to="/admin-manage-places">
            <FaMapMarkerAlt />
            {!collapsed && <span> Manage Places</span>}
          </Link>
        </li>
        <li className={isActive("/admin-manage-itineraries") ? "active" : ""}>
          <Link to="/admin-manage-itineraries">
            <FaCalendarAlt />
            {!collapsed && <span> Manage Itineraries</span>}
          </Link>
        </li>
        <li className={isActive("/admin-manage-events") ? "active" : ""}>
          <Link to="/admin-manage-events">
            <FaRegCalendarAlt />
            {!collapsed && <span> Manage Events</span>}
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
