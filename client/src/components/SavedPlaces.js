import React, { useState, useEffect } from "react";
import { useNavigate, Link }          from "react-router-dom";
import axiosInstance                  from "../utils/axiosConfig";
import Swal                           from "sweetalert2";
import { FiMapPin, FiTrash2 }         from "react-icons/fi";
import "../styles/SavedPlaces.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Fallback to a Google Static Map thumbnail
function staticMapUrl(lat, lng, size = "400x200") {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}` +
         `&zoom=15&size=${size}&markers=color:red%7C${lat},${lng}` +
         `&key=${API_KEY}`;
}

export default function SavedPlaces() {
  const nav = useNavigate();
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [details, setDetails]       = useState([]); // [{ entryId, place }]

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // 1) Fetch raw saved entries and all DB places
        const [savedRes, dbRes] = await Promise.all([
          axiosInstance.get("/saved-places"),
          axiosInstance.get("/places/db")
        ]);
        const saved = savedRes.data; // [{ _id, placeId }]
        const db    = dbRes.data;    // [{ _id, name, location, image, … }]

        // 2) Split into DB matches vs Google-only
        const dbMap     = new Map(db.map(p => [p._id, p]));
        const dbMatches = [];
        const googleIds = [];
        for (let entry of saved) {
          const p = dbMap.get(entry.placeId);
          if (p) {
            dbMatches.push({ entryId: entry._id, place: p });
          } else {
            googleIds.push({ entryId: entry._id, placeId: entry.placeId });
          }
        }

        // 3) Fetch Google Details for the Google-only IDs
        const googleMatches = await Promise.all(
          googleIds.map(async ({ entryId, placeId }) => {
            const { data } = await axiosInstance.get(`/places/db/${placeId}`);
            // shape into your Place model format:
            const place = {
              _id:         data.place_id,
              name:        data.name,
              description: data.formatted_address,
              category:    data.types?.[0] || "Other",
              location:    { coordinates: [data.geometry.location.lng, data.geometry.location.lat] },
              image:       data.photos?.[0]?.photo_reference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${data.photos[0].photo_reference}&key=${API_KEY}`
                : null
            };
            return { entryId, place };
          })
        );

        // 4) Merge and set
        setDetails([...dbMatches, ...googleMatches]);
      } catch (e) {
        console.error("Error loading saved places:", e);
        setError("Couldn’t load saved places.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Remove handler
  const handleRemove = async (entryId) => {
    try {
      await axiosInstance.delete(`/saved-places/${entryId}`);
      setDetails(d => d.filter(item => item.entryId !== entryId));
      Swal.fire({ icon: "success", title: "Removed", timer: 800 });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Couldn’t remove place", "error");
    }
  };

  // Navigate handler
  const handleNavigate = (coords) => {
    const [lng, lat] = coords;
    nav(`/map?lat=${lat}&lng=${lng}`);
  };

  if (loading) return (
    <div className="saved-container">
      <p>Loading saved places…</p>
    </div>
  );

  if (error) return (
    <div className="saved-container">
      <p className="error">{error}</p>
    </div>
  );

  return (
    <div className="saved-container">
      <header className="saved-header">
        <Link to="/explore" className="back-button">← Back to Explore</Link>
        <h1>Your Saved Places</h1>
      </header>

      {details.length === 0 ? (
        <div className="empty-state">
          <p>You haven’t saved any places yet.</p>
          <Link to="/explore" className="explore-btn">
            Explore Places
          </Link>
        </div>
      ) : (
        <div className="places-grid">
          {details.map(({ entryId, place }) => {
            const [lng, lat] = place.location.coordinates;
            const imgUrl = place.image || staticMapUrl(lat, lng);

            return (
              <div className="place-card" key={entryId}>
                <div
                  className="place-image"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                />
                <div className="place-info">
                  <h3>{place.name}</h3>
                  <p className="place-desc">{place.description}</p>
                  <p className="place-category">{place.category}</p>
                </div>
                <div className="card-actions">
                  <button
                    className="remove-btn"
                    onClick={() => handleRemove(entryId)}
                  >
                    <FiTrash2 /> Remove
                  </button>
                  <button
                    className="nav-btn"
                    onClick={() => handleNavigate(place.location.coordinates)}
                  >
                    <FiMapPin /> Navigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <footer className="saved-footer">
        Powered by Google
      </footer>
    </div>
  );
}
