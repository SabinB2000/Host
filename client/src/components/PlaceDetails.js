import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { FiHeart, FiMapPin, FiX, FiChevronRight } from "react-icons/fi";
import "../styles/PlaceDetail.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function staticMapUrl(lat, lng, size = "800x400") {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}` +
         `&zoom=16&size=${size}&markers=color:red%7C${lat},${lng}` +
         `&key=${API_KEY}`;
}

export default function PlaceDetails() {
  const { placeId } = useParams();
  const nav = useNavigate();

  const [place, setPlace] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [pois, setPois] = useState([]);
  const [saved, setSaved] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // STEP 1: Fetch the main place
        const { data: p } = await axiosInstance.get(`/places/db/${placeId}`);
        setPlace(p);

        // STEP 2: Get coordinates (robust)
        const lat = p.location?.coordinates?.[1] || p.geometry?.location?.lat;
        const lng = p.location?.coordinates?.[0] || p.geometry?.location?.lng;

        // STEP 3: Fetch other resources in parallel
        const [slRes, simRes, nearRes] = await Promise.all([
          axiosInstance.get("/saved-places"),
          axiosInstance.get(`/places/db/${placeId}/similar`),
          (lat && lng)
            ? axiosInstance.get("/places/poi", { params: { lat, lng } })
            : Promise.resolve({ data: [] })
        ]);

        setSimilar(simRes.data || []);
        setPois(nearRes.data || []);

        const savedPlace = slRes.data.find(x => x.placeId === placeId);
        if (savedPlace) {
          setSaved(true);
          setSavedEntryId(savedPlace._id);
        } else {
          setSaved(false);
          setSavedEntryId(null);
        }

      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || "Failed to load place details");
      } finally {
        setLoading(false);
      }
    })();
  }, [placeId]);


  const handleToggleSave = async () => {
    try {
      if (saved) {
        await axiosInstance.delete(`/saved-places/${savedEntryId}`);
        setSaved(false);
        Swal.fire({ 
          icon: "success", 
          title: "Removed from saved", 
          timer: 1000,
          showConfirmButton: false
        });
      } else {
        const res = await axiosInstance.post("/saved-places", { placeId });
        setSaved(true);
        setSavedEntryId(res.data._id);
        Swal.fire({ 
          icon: "success", 
          title: "Added to saved", 
          timer: 1000,
          showConfirmButton: false
        });
      }
    } catch (e) {
      if (e.response?.status === 401) {
        Swal.fire({
          title: "Login required",
          text: "Please sign in to save places",
          icon: "warning",
          confirmButtonText: "Go to Login"
        }).then(() => nav("/login"));
      } else {
        Swal.fire("Error", e.response?.data?.message || e.message, "error");
      }
    }
  };

  const handleNavigate = () => {
    if (!place) return;
    const lat = place.location?.coordinates?.[1] || place.geometry?.location?.lat;
    const lng = place.location?.coordinates?.[0] || place.geometry?.location?.lng;
    nav(`/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(place.name)}`);
  };

  if (loading) return (
    <div className="place-detail-loading">
      <div className="loading-spinner"></div>
    </div>
  );

  if (error) return (
    <div className="place-detail-error">
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  const heroImg = place.image || 
    (place.photos?.[0]?.photo_reference
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}`
      : staticMapUrl(
          place.location?.coordinates?.[1] || place.geometry?.location?.lat,
          place.location?.coordinates?.[0] || place.geometry?.location?.lng
        ));

  return (
    <div className="place-modal">
      <div className="place-content">
        {/* Header with close button */}
        <div className="place-header">
          <button className="close-btn" onClick={() => nav("/explore")}>
            <FiX size={24} />
          </button>
          <h1 className="place-title">{place.name}</h1>
        </div>

        {/* Hero image with save button */}
        <div className="hero-container">
          <img 
            src={heroImg} 
            alt={place.name} 
            className="hero-image"
          />
          <button 
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={handleToggleSave}
          >
            <FiHeart size={20} />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Main content area */}
        <div className="details-container">
          {/* Basic info section */}
          <div className="info-section">
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-text">{place.formatted_address || 'Not specified'}</span>
            </div>
            {place.category && (
              <div className="info-row">
                <span className="info-label">Category:</span>
                <span className="info-text">{place.category}</span>
              </div>
            )}
            {place.rating && (
              <div className="info-row">
                <span className="info-label">Rating:</span>
                <span className="info-text">{place.rating}/5</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="description-section">
            <h2 className="section-title">About</h2>
            <p className="description-text">
              {place.description || 'No description available.'}
            </p>
          </div>

          {/* Navigate button */}
          <button className="navigate-btn" onClick={handleNavigate}>
            <FiMapPin size={18} />
            <span>Navigate to this place</span>
            <FiChevronRight size={18} />
          </button>

          {/* Similar places */}
          {similar.length > 0 && (
            <div className="similar-section">
              <h2 className="section-title">Similar Places</h2>
              <div className="places-grid">
                {similar.map(s => (
                  <div 
                    key={s._id}
                    className="place-card"
                    onClick={() => nav(`/explore/place/${s._id}`)}
                  >
                    <img 
                      src={s.image || staticMapUrl(s.location.coordinates[1], s.location.coordinates[0], "400x200")} 
                      alt={s.name}
                      className="place-image"
                    />
                    <h3 className="place-name">{s.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby POIs */}
          {pois.length > 0 && (
            <div className="nearby-section">
              <h2 className="section-title">Nearby Points of Interest</h2>
              <div className="places-grid">
                {pois.map(poi => (
                  <div 
                    key={poi.place_id}
                    className="place-card"
                    onClick={() => nav(`/explore/place/${poi.place_id}`)}
                  >
                    <img 
                      src={poi.photos?.[0]?.photo_reference
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${poi.photos[0].photo_reference}&key=${API_KEY}`
                        : poi.icon || staticMapUrl(poi.geometry.location.lat, poi.geometry.location.lng, "400x200")} 
                      alt={poi.name}
                      className="place-image"
                    />
                    <div className="place-info">
                      <h3 className="place-name">{poi.name}</h3>
                      <p className="place-address">{poi.vicinity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}