import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import "../styles/Map.css";

const PlaceMap = ({ destination }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  // Map container style
  const mapContainerStyle = {
    height: "500px",
    width: "100%",
  };

  // Default center (Kathmandu Valley)
  const defaultCenter = {
    lat: 27.7172,
    lng: 85.3240,
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation(defaultCenter); // Fallback to default center
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation(defaultCenter);
    }
  }, []);

  // Calculate directions
  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === "OK") {
        setDirections(response);
      } else {
        console.error("Directions request failed:", response.status);
      }
    }
  };

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={12}
          onLoad={(map) => (mapRef.current = map)}
        >
          {userLocation && destination && (
            <DirectionsService
              options={{
                destination: { lat: destination.lat, lng: destination.lng },
                origin: userLocation,
                travelMode: "DRIVING",
              }}
              callback={directionsCallback}
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PlaceMap;