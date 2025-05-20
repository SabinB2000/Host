import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import { FiHeart, FiMapPin, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import noImage from "../assets/logo.png"; // Ensure this path is correct

import "../styles/Explore.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function staticMapUrl(lat, lng, size = "600x300") {
  // Validate coordinates
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return noImage; // Use local fallback instead of placeholder
  }
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=${size}&markers=color:red%7C${lat},${lng}&key=${API_KEY}`;
}

function getBestImage(p, coords, isSearch) {
  // Log for debugging
  console.log("Processing image for place:", p.name, { coords, isSearch });

  // 1. Custom DB image
  if (p.image && typeof p.image === "string" && p.image.trim()) {
    console.log("Using custom DB image:", p.image);
    return p.image;
  }

  // 2. Google Place photo
  if (p.photoRef) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photoRef}&key=${API_KEY}`;
    console.log("Using photoRef image:", url);
    return url;
  }
  if (p.photos?.[0]?.photo_reference) {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photos[0].photo_reference}&key=${API_KEY}`;
    console.log("Using photos array image:", url);
    return url;
  }

  // 3. Static Map if valid coordinates
  if (coords && Array.isArray(coords) && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    const url = staticMapUrl(coords[1], coords[0]); // [lng, lat] -> (lat, lng)
    console.log("Using static map image:", url);
    return url;
  }

  // 4. Fallback to local asset
  console.log("Using fallback image:", noImage);
  return noImage;
}

export default function Explore() {
  const nav = useNavigate();
  const [places, setPlaces] = useState([]);
  const [cats, setCats] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedMap, setSavedMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [{ data: db }, { data: saved }] = await Promise.all([
          axiosInstance.get("/places/db"),
          axiosInstance.get("/saved-places"),
        ]);

        setPlaces(db);
        setCats([...new Set(db.map((p) => p.category))]);

        const ids = new Set(saved.map((s) => s.placeId));
        setSavedIds(ids);

        const map = {};
        saved.forEach((s) => {
          map[s.placeId] = s._id;
        });
        setSavedMap(map);
      } catch (e) {
        console.error("Error loading places:", e);
        setError("Couldn't load places. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    try {
      const { data } = await axiosInstance.get("/places/google", {
        params: { query: search },
      });
      if (data.status !== "OK") throw new Error(data.status);

      setResults(
        data.results.map((p) => ({
          id: p.place_id,
          name: p.name,
          category: p.types?.[0] || "Other",
          desc: p.formatted_address,
          coords: [p.geometry.location.lng, p.geometry.location.lat],
          photoRef: p.photos?.[0]?.photo_reference || null,
          photos: p.photos,
          image: null, // Google API does not return custom images
        }))
      );
      setError("");
    } catch (e) {
      console.error("Search error:", e);
      setError("Search failed. Please check your connection and try again.");
      setResults([]);
    }
  };

  const toggleSave = async (placeId) => {
    if (savedIds.has(placeId)) {
      const entryId = savedMap[placeId];
      try {
        await axiosInstance.delete(`/saved-places/${entryId}`);
        setSavedIds((prev) => new Set([...prev].filter((id) => id !== placeId)));
        const newMap = { ...savedMap };
        delete newMap[placeId];
        setSavedMap(newMap);
        Swal.fire({ icon: "success", title: "Removed", timer: 800 });
      } catch (e) {
        Swal.fire("Error", "Couldn't remove place", "error");
      }
    } else {
      try {
        const res = await axiosInstance.post("/saved-places", { placeId });
        setSavedIds((prev) => new Set([...prev, placeId]));
        setSavedMap((prev) => ({ ...prev, [placeId]: res.data._id }));
        Swal.fire({ icon: "success", title: "Saved!", timer: 1200 });
      } catch (e) {
        if (e.response?.status === 401) {
          Swal.fire("Login required", "Please sign in to save places", "warning");
          nav("/login");
        } else {
          Swal.fire("Error", e.response?.data?.message || e.message, "error");
        }
      }
    }
  };

  const goMap = (coords, e) => {
    e.stopPropagation();
    const [lng, lat] = coords;
    nav(`/map?lat=${lat}&lng=${lng}`);
  };

  const toggleCategory = (cat) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
    setActiveCategory(activeCategory === cat ? null : cat);
  };

  const renderCards = (list, isSearch = false) => (
    <div className="places-grid">
      {list.map((p, index) => {
        const id = isSearch ? p.id : p._id;
        const coords = isSearch ? p.coords : p.location.coordinates;
        const img = getBestImage(p, coords, isSearch);

        return (
          <motion.div
            key={id}
            className="place-card"
            onClick={() => nav(`/explore/place/${id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="card-image-container">
              <img
                src={img}
                alt={p.name}
                loading="lazy"
                onError={(e) => {
                  console.warn(`Image failed to load for ${p.name}: ${img}`);
                  e.target.src = noImage; // Fallback on error
                }}
              />
              <div className="card-overlay">
                <button
                  className={`save-btn ${savedIds.has(id) ? "saved" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSave(id);
                  }}
                >
                  <FiHeart /> {savedIds.has(id) ? "Saved" : "Save"}
                </button>
              </div>
            </div>
            <div className="place-info">
              <h3>{p.name}</h3>
              <p className="desc">{p.desc || p.formatted_address}</p>
              <div className="card-footer">
                <span className="category-badge">{p.category}</span>
                <button className="nav-btn" onClick={(e) => goMap(coords, e)}>
                  <FiMapPin /> View on Map
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading)
    return (
      <div className="explore-container loading">
        <div className="loading-spinner"></div>
        <p>Discovering amazing places...</p>
      </div>
    );

  if (error)
    return (
      <div className="explore-container error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );

  return (
    <div className="explore-container">
      <header className="explore-header">
        <div className="header-content">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Nepal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Discover the hidden gems of the Himalayas
          </motion.p>
          <motion.form
            onSubmit={doSearch}
            className="search-form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                className="search-input"
                placeholder="Search for places, temples, trails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button">
              Search
            </button>
          </motion.form>
        </div>
      </header>

      <main className="explore-main">
        {results.length > 0 && (
          <section className="search-results">
            <h2>Search Results</h2>
            {renderCards(results, true)}
          </section>
        )}

        <div className="categories-container">
          {cats.map((cat) => {
            const arr = places.filter((p) => p.category === cat);
            const isExpanded = !!expanded[cat];
            const shown = isExpanded ? arr : arr.slice(0, 4);

            return (
              <section key={cat} className="category-section">
                <div className="category-header" onClick={() => toggleCategory(cat)}>
                  <h2>{cat}</h2>
                  <button className="view-all">
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    {isExpanded ? "Show Less" : `View All (${arr.length})`}
                  </button>
                </div>

                <AnimatePresence>
                  {activeCategory === cat || !activeCategory ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderCards(shown)}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}