import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Import BrowserRouter
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import api from "./utils/axiosConfig";import { AuthProvider } from "./contexts/AuthContext";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);



// ✅ API Functions (Keep These)
export const fetchProfile = async () => {
  return axios.get("/api/profile/me", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

export const updateProfile = async (data) => {
  return axios.put("/api/profile/update", data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
};

// ✅ Performance Monitoring
reportWebVitals();