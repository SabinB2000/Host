import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosConfig";
import {
  LoadScript,
  GoogleMap,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  FaCar,
  FaWalking,
  FaBus,
} from "react-icons/fa";
import { GiPathDistance, GiDuration } from "react-icons/gi";
import "../styles/Recommendations.css";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
  overflow: "hidden",
};

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  // 1) fetch recs
  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get("/places/recommended?limit=10");
      setRecs(res.data);
    })();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
        () => alert("Location denied, defaulting to Kathmandu")
      );
    }
  }, []);

  // 2) whenever selected or mode changes, regen route
  useEffect(() => {
    if (!selected || !userLoc) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: userLoc,
        destination: { lat: selected.latitude, lng: selected.longitude },
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (res, status) => {
        if (status === "OK") {
          setDirections(res);
          const leg = res.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
        }
      }
    );
  }, [selected, travelMode, userLoc]);

  const TravelButton = ({ mode, icon: Icon, label }) => (
    <button
      className={travelMode === mode ? "active" : ""}
      onClick={() => setTravelMode(mode)}
    >
      <Icon /> {label}
    </button>
  );

  return (
    <div className="recommendations-page">
      <h2>Recommended for You</h2>

      <div className="rec-grid">
        {recs.map(r => (
          <div
            key={r._id}
            className={`rec-card ${selected?._id===r._id? "sel":""}`}
            onClick={() => {
              setSelected(r);
              setDirections(null);
            }}
          >
            <img src={r.imageUrl} alt={r.name} />
            <div className="info">
              <h3>{r.name}</h3>
              <p>{r.category}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rec-map-container">
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLoc || { lat: 27.7172, lng: 85.324 }}
            zoom={11}
          >
            {userLoc && (
              <Marker
                position={userLoc}
                label="You"
                icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              />
            )}
            {recs.map(r => (
              <Marker
                key={r._id}
                position={{ lat: r.latitude, lng: r.longitude }}
                icon={
                  selected?._id === r._id
                    ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }
                onClick={() => setSelected(r)}
              />
            ))}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{ suppressMarkers: true }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {selected && (
        <div className="rec-details">
          <h3>{selected.name}</h3>
          <div className="travel-modes">
            <TravelButton mode="DRIVING" icon={FaCar}    label="Drive" />
            <TravelButton mode="WALKING" icon={FaWalking} label="Walk" />
            <TravelButton mode="TRANSIT" icon={FaBus}     label="Transit" />
          </div>
          <div className="stats">
            <span><GiPathDistance /> {distance}</span>
            <span><GiDuration /> {duration}</span>
          </div>
        </div>
      )}
    </div>
  );
}
