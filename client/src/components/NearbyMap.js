import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript
} from "@react-google-maps/api";
import "../styles/NearbyMap.css";

export default function NearbyMap({ placeCoords, onClose }) {
  // load the maps + places library
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: ["places"],
  });

  const [map, setMap]         = useState(null);
  const [pois, setPois]       = useState([]);
  const [selectedPoi, setPoi] = useState(null);

  // once map is ready, fetch nearby POIs
  const handleMapLoad = useCallback((m) => {
    setMap(m);
    const service = new window.google.maps.places.PlacesService(m);
    service.nearbySearch({
      location: placeCoords,
      radius: 2000,
      type: ["tourist_attraction", "restaurant", "cafe"],
    }, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPois(results);
      }
    });
  }, [placeCoords]);

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div className="nearby-overlay">
      <button className="nearby-close" onClick={onClose}>×</button>
      <div className="nearby-map-container">
        <GoogleMap
          onLoad={handleMapLoad}
          center={placeCoords}
          zoom={14}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {pois.map(p => (
            <Marker
              key={p.place_id}
              position={p.geometry.location}
              onClick={() => setPoi(p)}
            />
          ))}

          {selectedPoi && (
            <InfoWindow
              position={selectedPoi.geometry.location}
              onCloseClick={() => setPoi(null)}
            >
              <div>
                <h4>{selectedPoi.name}</h4>
                {selectedPoi.rating && <p>⭐ {selectedPoi.rating}</p>}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      <div className="nearby-list">
        <h3>Nearby Places</h3>
        <ul>
          {pois.map(p => (
            <li key={p.place_id}
                onClick={() => {
                  map.panTo(p.geometry.location);
                  map.setZoom(16);
                  setPoi(p);
                }}>
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
