import React from "react";
import ImageSlider from "./ImageSlider";
import "../styles/PlaceModal.css";

const UNSPLASH_ACCESS_KEY = "LIoaOeFaFZsQHpmN4LTFfCswzlOLjCMc27sC0ACS0gY";

export default function PlaceModal({ place, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content place-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Rotating gallery of place images */}
        <div className="place-slider-container">
          <ImageSlider
            accessKey={UNSPLASH_ACCESS_KEY}
            query={place.query}
            slides={5}
            className="place-slider"
          />
        </div>

        <h2 className="place-modal-title">{place.name}</h2>
        <p className="place-modal-desc">{place.description}</p>
      </div>
    </div>
  );
}
