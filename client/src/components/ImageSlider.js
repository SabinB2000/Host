import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ImageSlider.css";

export default function ImageSlider({
  accessKey,
  query,
  slides = 5,
  className = "",
  showDescriptions = false,
  description = "",
  ...props
}) {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  // 1) Fetch images on mount
  useEffect(() => {
    let isMounted = true;
    axios
      .get("https://api.unsplash.com/search/photos", {
        params: { query, per_page: slides },
        headers: { Authorization: `Client-ID ${accessKey}` },
      })
      .then((res) => {
        if (isMounted) {
          const urls = res.data.results.map((r) => r.urls.regular);
          setImages(urls);
        }
      })
      .catch((err) => {
        console.error("Unsplash fetch error:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [accessKey, query, slides]);

  // 2) Auto‑advance every 3 seconds
  useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images.length) {
    return <div className={`image-slider placeholder ${className}`}>Loading...</div>;
  }

  return (
    <div className={`image-slider ${className}`} {...props}>
      {images.map((img, index) => (
        <div
          key={index}
          className={`slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        >
          {showDescriptions && description && index === current && (
            <div className="image-description">{description}</div>
          )}
        </div>
      ))}
    </div>
  );
}