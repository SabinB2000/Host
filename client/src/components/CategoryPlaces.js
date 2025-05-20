import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/Explore.css";

const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

const fetchUnsplashImage = async (query) => {
  try {
    const { data } = await axios.get("https://api.unsplash.com/search/photos", {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      params: { query, per_page: 1 },
    });
    return data.results[0]?.urls?.regular || "/assets/placeholder.png";
  } catch {
    return "/assets/placeholder.png";
  }
};

export default function CategoryPlaces() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState({});
  const [relatedPlaces, setRelatedPlaces] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: allPlaces } = await axiosInstance.get("/places/recommended");
        const filteredPlaces = allPlaces.filter(p => p.place?.category === category);
        setPlaces(filteredPlaces);

        const imagePromises = filteredPlaces.map(async (place) => ({
          placeId: place._id,
          imageUrl: await fetchUnsplashImage(`${place.title} ${category} Nepal`),
        }));
        const imageResults = await Promise.all(imagePromises);
        setImages(Object.fromEntries(imageResults.map(r => [r.placeId, r.imageUrl])));

        if (filteredPlaces.length > 0) {
          const [lng, lat] = filteredPlaces[0].place.location.coordinates;
          const { data: nearby } = await axiosInstance.get(`/places/nearby?lat=${lat}&lng=${lng}`);
          setRelatedPlaces(nearby.slice(0, 3));
        }
      } catch (err) {
        setError("Failed to load places.");
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  const handleSavePlace = async (placeId) => {
    try {
      await axiosInstance.post("/saved-places", { placeId });
      Swal.fire({ icon: "success", title: "Saved!", timer: 1200 });
    } catch (e) {
      Swal.fire("Error", "Failed to save place", "error");
    }
  };

  if (loading) return <div className="explore-container"><div className="loading"><p>Loading places...</p></div></div>;
  if (error) return <div className="explore-container"><div className="error"><p>{error}</p></div></div>;

  return (
    <div className="explore-container">
      <header className="explore-header">
        <h1>{category} in Kathmandu Valley</h1>
        <p>Explore the best {category.toLowerCase()} places</p>
        <button className="back-button" onClick={() => navigate("/explore")}>Back to Explore</button>
      </header>

      <main className="explore-main">
        {places.length > 0 ? (
          <div className="places-grid">
            {places.map((place) => (
              <div key={place._id} className="place-card">
                <img src={images[place._id]} alt={place.title} onClick={() => navigate(`/explore/place/${place._id}`)} />
                <div className="place-info">
                  <h3>{place.title || "Untitled Place"}</h3>
                  <p>{place.shortDescription || "No description available"}</p>
                  <p className="category">Category: {place.place?.category || "Unknown"}</p>
                  <button onClick={() => handleSavePlace(place._id)} className="save-btn">Save</button>
                  <button
                    onClick={() => {
                      const [lng, lat] = place.place.location.coordinates;
                      navigate(`/map?lat=${lat}&lng=${lng}&name=${encodeURIComponent(place.title)}`);
                    }}
                    className="navigate-btn"
                  >
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No places found in this category.</p>
        )}

        {relatedPlaces.length > 0 && (
          <section className="related-places">
            <h3>Related Places</h3>
            <div className="places-grid">
              {relatedPlaces.map((place) => (
                <div key={place._id} className="place-card small" onClick={() => navigate(`/explore/place/${place._id}`)}>
                  <img src={images[place._id] || "/assets/placeholder.png"} alt={place.name} />
                  <h4>{place.name}</h4>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="explore-footer">
        Powered by Google | Images by Unsplash
      </footer>
    </div>
  );
}