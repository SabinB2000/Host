import React, { useEffect, useState } from "react";
import axios from "axios";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import "../styles/Recommended.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const GMAP_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const mapStyle = { width:"100%", height:"350px" };

export default function Recommended() {
  const [list, setList]   = useState([]);
  const [userLoc, setLoc] = useState({ lat:27.7172, lng:85.324 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/places/recommended?limit=10`)
      .then(r=> setList(r.data))
      .catch(console.error)
      .finally(()=>setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p=> setLoc({ lat:p.coords.latitude, lng:p.coords.longitude }),
        ()=>{}
      );
    }
  }, []);

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <div className="recommended-page">
      <h1>Recommended Places</h1>
      <div className="cards-grid">
        {list.map(p => (
          <div key={p._id} className="rec-card">
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} />}
            <h3>{p.name}</h3>
            <p>{p.category}</p>
            <p className="desc">{p.description}</p>
          </div>
        ))}
      </div>
      <LoadScript googleMapsApiKey={GMAP_KEY}>
        <GoogleMap mapContainerStyle={mapStyle} center={userLoc} zoom={10}>
          <Marker position={userLoc} icon={{ url:"https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}/>
          {list.map(p => (
            <Marker
              key={p._id}
              position={{ lat:p.latitude, lng:p.longitude }}
              title={p.name}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
