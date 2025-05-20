// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance                  from "../utils/axiosConfig";
import Swal                           from "sweetalert2";
import { Link, useNavigate }          from "react-router-dom";
import {
  FiMapPin, FiCalendar, FiStar,
  FiSearch, FiHeart, FiClock
} from "react-icons/fi";
import { IoIosArrowForward }         from "react-icons/io";
import { RiRestaurantLine, RiLandscapeLine } from "react-icons/ri";
import "../styles/Dashboard.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Fallback to a Google Static Map thumbnail
function staticMapUrl(lat, lng, size = "600x300") {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}` +
         `&zoom=15&size=${size}&markers=color:red%7C${lat},${lng}` +
         `&key=${API_KEY}`;
}

export default function Dashboard() {
  const nav = useNavigate();

  // Core data
  const [user, setUser]                     = useState(null);
  const [savedEntries, setSavedEntries]     = useState([]); // { _id, placeId }
  const [dbPlaces, setDbPlaces]             = useState([]); // all Mongo places
  const [savedDetails, setSavedDetails]     = useState([]); // merged [{ entryId, place }]
  const [recentSearches, setRecentSearches] = useState([]);
  const [events, setEvents]                 = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Profile
        const { data: userData } = await axiosInstance.get("/auth/profile/me");
        setUser(userData);

        // 2) Saved entries, DB places, searches, events
        const [sRes, dbRes, srRes, evRes] = await Promise.all([
          axiosInstance.get("/saved-places"),
          axiosInstance.get("/places/db"),
          axiosInstance.get("/searches"),
          axiosInstance.get("/events?limit=3")
        ]);
        const saved = sRes.data;
        const db    = dbRes.data;
        setSavedEntries(saved);
        setDbPlaces(db);
        setRecentSearches(srRes.data);
        setEvents(evRes.data);

        // Map DB places by _id for quick lookup
        const dbMap = new Map(db.map(p => [p._id, p]));

        // Separate saved entries into DB vs Google-only
        const dbMatches = [];
        const googleIds = [];
        for (let entry of saved) {
          if (dbMap.has(entry.placeId)) {
            dbMatches.push({ entryId: entry._id, place: dbMap.get(entry.placeId) });
          } else {
            googleIds.push({ entryId: entry._id, placeId: entry.placeId });
          }
        }

        // 3) Fetch Google details for Google-only IDs
        const googleMatches = await Promise.all(
          googleIds.map(async ({ entryId, placeId }) => {
            const { data } = await axiosInstance.get(`/places/db/${placeId}`);
            // shape it to match your Place model
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
        setSavedDetails([...dbMatches, ...googleMatches]);
      } catch (e) {
        console.error("Dashboard load error:", e);
        if (e.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load dashboard. Try again later.");
          Swal.fire("Error", "Couldn’t load dashboard data", "error");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading your travel dashboard…</p>
    </div>
  );
  if (error) return (
    <div className="dashboard-container">
      <div className="error">{error}</div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-overlay" />
        <div className="welcome-section">
          <div className="profile-container">
            <div className="profile-pic-container">
              <img
                src={
                  user?.profilePicture
                    ? `${process.env.REACT_APP_API_URL}${user.profilePicture}`
                    : "/assets/default-profile.png"
                }
                alt="Profile"
                className="profile-pic"
              />
              <div className="active-dot" />
            </div>
            <div className="welcome-text">
              <p className="greeting">Welcome back,</p>
              <h1>
                {user?.firstName || "Traveler"}! <span className="welcome-emoji">✈️</span>
              </h1>
              <p className="subtext">Ready for your next adventure?</p>
            </div>
          </div>
        </div>

        <div className="quick-actions-container">
          <div className="quick-actions">
            <Link to="/map" className="action-card">
              <div className="action-icon map"><FiMapPin /></div>
              <span>Explore Map</span>
            </Link>
            <Link to="/saved" className="action-card">
              <div className="action-icon saved"><FiStar /></div>
              <span>Saved Places</span>
            </Link>
            <Link to="/itinerary" className="action-card">
              <div className="action-icon itinerary"><FiCalendar /></div>
              <span>Itineraries</span>
            </Link>
            <Link to="/events" className="action-card">
              <div className="action-icon events"><FiCalendar /></div>
              <span>Nearby Events</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="dashboard-main">

        {/* Saved Places */}
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title">
              <FiStar className="section-icon" />
              <h2>Saved Places</h2>
            </div>
            <Link to="/saved" className="view-all">
              View All <IoIosArrowForward className="arrow-icon" />
            </Link>
          </div>

          {savedDetails.length > 0 ? (
            <div className="places-grid">
              {savedDetails.slice(0, 4).map(({ entryId, place }) => {
                const [lng, lat] = place.location.coordinates;
                const imgUrl = place.image || staticMapUrl(lat, lng);

                return (
                  <Link
                    to={`/explore/place/${place._id}`}
                    key={entryId}
                    className="place-card"
                  >
                    <div
                      className="place-image"
                      style={{ backgroundImage: `url(${imgUrl})` }}
                    >
                      <div className="favorite-badge">
                        <FiHeart />
                      </div>
                    </div>
                    <div className="place-info">
                      <h3>{place.name}</h3>
                      <p className="place-location">
                        <FiMapPin /> {place.description || place.category}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FiStar className="empty-icon" />
              <p>No saved places yet.</p>
              <Link to="/explore" className="explore-btn">Explore Now</Link>
            </div>
          )}
        </section>

        {/* Recent Searches */}
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title">
              <FiSearch className="section-icon" />
              <h2>Recent Searches</h2>
            </div>
          </div>
          {recentSearches.length > 0 ? (
            <div className="searches-list">
              {recentSearches.slice(0, 5).map(s => (
                <div key={s._id} className="search-item">
                  <div className="search-content">
                    <FiClock className="search-icon" />
                    <span>{s.query}</span>
                  </div>
                  <button
                    className="search-again"
                    onClick={() =>
                      nav(`/explore?search=${encodeURIComponent(s.query)}`)
                    }
                  >
                    Search Again
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiSearch className="empty-icon" />
              <p>No recent searches yet.</p>
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        {events.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <div className="section-title">
                <FiCalendar className="section-icon" />
                <h2>Upcoming Events</h2>
              </div>
              <Link to="/events" className="view-all">
                View All <IoIosArrowForward className="arrow-icon" />
              </Link>
            </div>
            <div className="events-list">
              {events.map(evt => {
                const date = new Date(evt.date);
                return (
                  <Link
                    to={`/events/${evt._id}`}
                    key={evt._id}
                    className="event-card"
                  >
                    <div className="event-date">
                      <span className="day">{date.getDate()}</span>
                      <span className="month">
                        {date.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>
                    <div className="event-info">
                      <h3>{evt.title}</h3>
                      <p><FiMapPin /> {evt.location}</p>
                    </div>
                    <div className="event-cat">
                      {evt.category === "food"
                        ? <RiRestaurantLine />
                        : <RiLandscapeLine />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
