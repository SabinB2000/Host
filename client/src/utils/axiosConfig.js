// src/utils/axiosConfig.js
import api from "../utils/axiosConfig";

// pull from your .env (REACT_APP_API_URL=http://localhost:5000/api)
const API_BASE = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  // allows cookies (if you ever set `withCredentials` on the server)
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
