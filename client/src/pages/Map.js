import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  TrafficLayer,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import {
  FaCar,
  FaWalking,
  FaMapMarkerAlt,
  FaRoute,
  FaTrafficLight,
  FaCompass,
  FaStop,
  FaPlay,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { IoMdNavigate } from "react-icons/io";
import { MdDirections, MdMyLocation } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Map.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const Map = () => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [navigationActive, setNavigationActive] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [distanceToNextStep, setDistanceToNextStep] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [isLocating, setIsLocating] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const watchIdRef = useRef(null);
  const startAutocomplete = useRef(null);
  const destAutocomplete = useRef(null);
  const speechSynthesis = useRef(window.speechSynthesis);
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  // Check for mobile devices and dark mode preference
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(darkModeMediaQuery.matches);
    darkModeMediaQuery.addListener((e) => setDarkMode(e.matches));

    return () => {
      window.removeEventListener("resize", checkMobile);
      darkModeMediaQuery.removeListener((e) => setDarkMode(e.matches));
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lat = parseFloat(params.get("lat"));
    const lng = parseFloat(params.get("lng"));
    const name = params.get("name");

    if (lat && lng) {
      setDestination({ lat, lng, name: name || "Destination" });
      if (isMobile) setMobilePanelOpen(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      // Cancel any ongoing speech when component unmounts
      speechSynthesis.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (isLoaded && startLocation && destination) {
      calculateRoute();
    }
  }, [isLoaded, startLocation, destination, travelMode]);

  useEffect(() => {
    if (routeSteps.length > 0 && currentStepIndex < routeSteps.length) {
      const step = routeSteps[currentStepIndex];
      const instruction = step.instructions.replace(/<[^>]*>/g, "");
      setCurrentInstruction(instruction);
      setDistanceToNextStep(step.distance.text);
      
      // Speak the instruction if voice is enabled
      if (voiceEnabled && navigationActive) {
        speakInstruction(instruction, step.distance.text);
      }
    } else if (currentStepIndex >= routeSteps.length && navigationActive) {
      setCurrentInstruction("You have reached your destination!");
      if (voiceEnabled) {
        speakInstruction("You have reached your destination");
      }
      stopNavigation();
    }
  }, [currentStepIndex, routeSteps, navigationActive]);

  const speakInstruction = (instruction, distance) => {
    speechSynthesis.current.cancel();
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = distance ? `${distance}. ${instruction}` : instruction;
    utterance.rate = 0.9;
    speechSynthesis.current.speak(utterance);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled && navigationActive && currentInstruction) {
      speakInstruction(currentInstruction, distanceToNextStep);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          setStartLocation(loc);
          if (map) {
            map.panTo(loc);
            map.setZoom(15);
          }
          setIsLocating(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          const defaultLoc = { lat: 27.7172, lng: 85.324 };
          setUserLocation(defaultLoc);
          setStartLocation(defaultLoc);
          if (map) {
            map.panTo(defaultLoc);
            map.setZoom(13);
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const onPlaceChanged = (isStart) => {
    const autocomplete = isStart ? startAutocomplete.current : destAutocomplete.current;
    if (autocomplete && autocomplete.getPlace()) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name || place.formatted_address,
        };
        if (isStart) {
          setStartLocation(loc);
        } else {
          setDestination(loc);
        }
      }
    }
  };

  const calculateRoute = () => {
    if (!isLoaded || !startLocation || !destination) {
      alert("Please ensure both start and destination locations are set.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: startLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        provideRouteAlternatives: true,
      },
      (res, status) => {
        if (status === "OK") {
          setDirections(res);
          setRouteSteps(res.routes[0].legs[0].steps);
          setCurrentStepIndex(0);
          setCurrentInstruction(res.routes[0].legs[0].start_address);
          const bounds = new window.google.maps.LatLngBounds();
          res.routes[0].legs[0].steps.forEach((step) => {
            bounds.extend(step.start_location);
            bounds.extend(step.end_location);
          });
          if (map) map.fitBounds(bounds);
          if (isMobile) setMobilePanelOpen(true);
        } else {
          alert("Directions request failed. Please try again.");
        }
      }
    );
  };

  const startNavigation = () => {
    if (!directions || routeSteps.length === 0) {
      alert("Please calculate directions first!");
      return;
    }
    setNavigationActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        if (map) map.panTo(newLoc);

        if (currentStepIndex < routeSteps.length) {
          const nextStep = routeSteps[currentStepIndex];
          const stepLoc = nextStep.start_location;
          const dist = getDistance(newLoc, { lat: stepLoc.lat(), lng: stepLoc.lng() });
          if (dist < 30) {
            setCurrentStepIndex((idx) => idx + 1);
          }
        }
      },
      (err) => console.error("Navigation error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const stopNavigation = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    speechSynthesis.current.cancel();
    setNavigationActive(false);
  };

  const resetMap = () => {
    stopNavigation();
    setDirections(null);
    setRouteSteps([]);
    setCurrentStepIndex(0);
    setCurrentInstruction("");
    setDistanceToNextStep(null);
    setDestination(null);
    setStartLocation(userLocation);
    if (map) {
      map.panTo(userLocation || { lat: 27.7172, lng: 85.324 });
      map.setZoom(13);
    }
    if (isMobile) setMobilePanelOpen(false);
  };

  const getDistance = (p1, p2) => {
    const R = 6371e3;
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toggleMobilePanel = () => {
    setMobilePanelOpen(!mobilePanelOpen);
  };

  if (!isLoaded)
    return (
      <div className={`loading-screen ${darkMode ? "dark" : ""}`}>
        <div className="loading-spinner"></div>
        <p>Loading Maps...</p>
      </div>
    );

  if (loadError)
    return (
      <div className={`error-screen ${darkMode ? "dark" : ""}`}>
        <h2>⚠️ Google Maps failed to load</h2>
        <p>Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );

  return (
    <div className={`map-app ${darkMode ? "dark" : ""}`}>
      <div className="map-header">
        <h1>
          <FaCompass className="header-icon" />
          Nepal Navigator
        </h1>
        <p>Find your way through Nepal's beautiful landscapes</p>
      </div>

      <div className="map-container">
        <div className={`map-wrapper ${mobilePanelOpen ? "hidden-on-mobile" : ""}`}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={userLocation || { lat: 27.7172, lng: 85.324 }}
            zoom={13}
            onLoad={(mapInstance) => setMap(mapInstance)}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              mapTypeId: mapType,
              styles: darkMode ? [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }]
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }]
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1f2835" }]
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#f3d19c" }]
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#2f3948" }]
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }]
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#515c6d" }]
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#17263c" }]
                }
              ] : [
                { featureType: "poi", stylers: [{ visibility: "off" }] },
                { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
              ],
            }}
          >
            {showTraffic && <TrafficLayer autoUpdate />}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {startLocation && startLocation !== userLocation && (
              <Marker
                position={startLocation}
                label={{ text: "A", color: "white", fontWeight: "bold" }}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {destination && (
              <Marker
                position={destination}
                label={{ text: "B", color: "white", fontWeight: "bold" }}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: darkMode ? "#4a8cff" : "#3f51b5",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                  suppressMarkers: true,
                }}
              />
            )}
          </GoogleMap>

          {isMobile && (
            <button className="mobile-toggle-panel" onClick={toggleMobilePanel}>
              {mobilePanelOpen ? "Show Map" : "Show Controls"}
            </button>
          )}
        </div>

        <div className={`controls-panel ${mobilePanelOpen ? "mobile-open" : ""}`}>
          <div className="panel-header">
            <h3>Navigation Controls</h3>
            {isMobile && (
              <button className="close-panel" onClick={toggleMobilePanel}>
                &times;
              </button>
            )}
          </div>

          <div className="search-container">
            <div className="search-group">
              <label>
                <FaMapMarkerAlt className="input-icon" /> Start Point
              </label>
              <button
                className="current-location-btn"
                onClick={getCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <MdMyLocation /> Use Current Location
                  </>
                )}
              </button>
              <Autocomplete
                onLoad={(auto) => (startAutocomplete.current = auto)}
                onPlaceChanged={() => onPlaceChanged(true)}
              >
                <input
                  type="text"
                  placeholder="Enter starting location"
                  className="search-input"
                  value={startLocation?.name || ""}
                  onChange={(e) => setStartLocation({ ...startLocation, name: e.target.value })}
                />
              </Autocomplete>
            </div>

            <div className="search-group">
              <label>
                <FaMapMarkerAlt className="input-icon" /> Destination
              </label>
              <Autocomplete
                onLoad={(auto) => (destAutocomplete.current = auto)}
                onPlaceChanged={() => onPlaceChanged(false)}
              >
                <input
                  type="text"
                  placeholder="Enter destination"
                  className="search-input"
                  value={destination?.name || ""}
                  onChange={(e) => setDestination({ ...destination, name: e.target.value })}
                />
              </Autocomplete>
            </div>
          </div>

          <div className="settings-group">
            <div className="map-view-selector">
              <label htmlFor="mapType">Map View: </label>
              <select
                id="mapType"
                value={mapType}
                onChange={(e) => setMapType(e.target.value)}
              >
                <option value="roadmap">Roadmap</option>
                <option value="satellite">Satellite</option>
                <option value="hybrid">Hybrid</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>

            <div className="toggle-group">
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`toggle-btn ${showTraffic ? "active" : ""}`}
              >
                <FaTrafficLight /> Traffic
              </button>
              <button
                onClick={toggleVoice}
                className={`toggle-btn ${voiceEnabled ? "active" : ""}`}
              >
                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />} Voice
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="toggle-btn"
              >
                {darkMode ? <FaSun /> : <FaMoon />} Theme
              </button>
            </div>
          </div>

          <div className="mode-selector">
            <button
              className={`mode-btn ${travelMode === "DRIVING" ? "active" : ""}`}
              onClick={() => setTravelMode("DRIVING")}
            >
              <FaCar /> Drive
            </button>
            <button
              className={`mode-btn ${travelMode === "WALKING" ? "active" : ""}`}
              onClick={() => setTravelMode("WALKING")}
            >
              <FaWalking /> Walk
            </button>
          </div>

          <div className="action-buttons">
            <button
              onClick={calculateRoute}
              className="action-btn primary"
              disabled={!startLocation || !destination}
            >
              <MdDirections /> Get Directions
            </button>
            <button onClick={resetMap} className="action-btn reset">
              <FaRedo /> Reset
            </button>
          </div>

          {navigationActive ? (
            <button onClick={stopNavigation} className="action-btn danger">
              <FaStop /> Stop Navigation
            </button>
          ) : (
            <button
              onClick={startNavigation}
              className="action-btn success"
              disabled={!directions}
            >
              <FaPlay /> Start Navigation
            </button>
          )}

          {navigationActive && currentInstruction && (
            <div className="navigation-instruction">
              <div className="instruction-header">
                <IoMdNavigate className="nav-icon" />
                <h3>Current Instruction</h3>
              </div>
              <p>{currentInstruction}</p>
              {distanceToNextStep && (
                <p className="distance-info">
                  <strong>Next step in {distanceToNextStep}</strong>
                </p>
              )}
              <div className="step-progress">
                Step {currentStepIndex + 1} of {routeSteps.length}
              </div>
            </div>
          )}

          {directions && !navigationActive && (
            <div className="route-summary">
              <h3>
                <FaRoute className="summary-icon" />
                Route Summary
              </h3>
              <div className="summary-item">
                <span>Distance:</span>
                <strong>{directions.routes[0].legs[0].distance.text}</strong>
              </div>
              <div className="summary-item">
                <span>Duration:</span>
                <strong>{directions.routes[0].legs[0].duration.text}</strong>
              </div>
              <div className="summary-item">
                <span>Mode:</span>
                <strong>{travelMode.toLowerCase()}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;