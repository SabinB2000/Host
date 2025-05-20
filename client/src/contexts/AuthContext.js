import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";             // ← import
import axiosInstance from "../utils/axiosConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate            = useNavigate();               // ← grab navigate

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    axiosInstance
      .get("/auth/profile/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (u, token) => {
    localStorage.setItem("token", token);
    setUser(u);
  };

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");       // ← now navigate works
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
