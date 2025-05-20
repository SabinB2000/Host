// src/pages/vendor/Places.js
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import VendorSidebar from "../../components/VendorSidebar";
import "../../styles/ManagePlaces.css";

export default function ManagePlaces() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axiosInstance.get("/vendor/places")
      .then(res => setPlaces(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="vendor-page">
      <VendorSidebar onLogout={() => {}} />
      <div className="vendor-content">
        <h1>Your Places</h1>
        {places.length === 0 ? (
          <p>No places yet.</p>
        ) : (
          <ul>
            {places.map(p => (
              <li key={p._id}>{p.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
