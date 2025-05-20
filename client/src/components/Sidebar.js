import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FiHome, FiCalendar, FiCompass, FiMap, FiGlobe,
  FiStar, FiUser, FiLogOut, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { motion } from "framer-motion";
import "../styles/Sidebar.css";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);

  // 1️⃣ Sync a class on <body> so .main-content can slide
  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", !isOpen);
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const menuItems = [
    { path: "/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/itinerary", icon: FiCalendar, label: "Itinerary" },
    { path: "/explore", icon: FiCompass, label: "Explore" },
    { path: "/map", icon: FiMap, label: "Map" },
    { path: "/translate", icon: FiGlobe, label: "Translate" },
    { path: "/reviews", icon: FiStar, label: "Reviews" },
    { path: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <motion.div
      className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header">
        {isOpen && (
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="user-details">
              <h3>Hello, {user?.name || "User"}</h3>
              <p>{user?.email || "Welcome back!"}</p>
            </div>
          </div>
        )}
        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      <ul className="menu-list">
        {menuItems.map((item, idx) => (
          <motion.li
            key={item.path}
            className={isActive(item.path) ? "active" : ""}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredItem(idx)}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <Link to={item.path}>
              <item.icon className="icon" />
              {isOpen && <span className="label">{item.label}</span>}
              {!isOpen && hoveredItem === idx && (
                <motion.span
                  className="tooltip"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          </motion.li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <motion.button
          className="logout-btn"
          onClick={handleLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiLogOut className="icon" />
          {isOpen && <span className="label">Logout</span>}
        </motion.button>
      </div>
    </motion.div>
  );
}
