import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiUser, FiLogIn, FiLogOut, FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import AuthForm from "./AuthForm";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

export default function Navbar({ openAuth }) {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logged Out!",
      text: "You have been logged out successfully.",
      icon: "info",
      timer: 1500,
      showConfirmButton: false,
      background: '#2d3436',
      color: '#fff'
    }).then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {user ? (
        <Sidebar user={user} handleLogout={handleLogout} />
      ) : (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
          <div className="navbar__container">
            <Link
              to="/"
              className="navbar__logo"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img src={logo} alt="Guide Nepal Logo" />
              <span>Guide Nepal</span>
            </Link>

            <div className={`navbar__links ${mobileMenuOpen ? 'navbar__links--open' : ''}`}>
              <Link to="/" className="navbar__link" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/destinations" className="navbar__link" onClick={() => setMobileMenuOpen(false)}>
                Destinations
              </Link>
              <Link to="/about" className="navbar__link" onClick={() => setMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/contact" className="navbar__link" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </Link>
            </div>

            <div className="navbar__actions">
              <button
                className="navbar__auth-btn"
                onClick={openAuth}
              >
                <FiLogIn className="navbar__icon" />
                <span>Login / Signup</span>
              </button>
            </div>

            <button className="navbar__mobile-menu" onClick={toggleMobileMenu}>
              <FiMenu />
            </button>
          </div>
        </nav>
      )}

      {showAuth && (
        <AuthForm
          closeAuth={() => {
            setShowAuth(false);
            const stored = localStorage.getItem("user");
            if (stored) setUser(JSON.parse(stored));
          }}
          setUser={setUser}
        />
      )}
    </>
  );
}