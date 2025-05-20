require("dotenv").config();
const mongoose = require("mongoose");
const fetch = require("node-fetch").default;
const Place = require("../models/Place");
const RecommendedPlace = require("../models/RecommendedPlace");

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_PLACES_API_KEY) {
  console.error("❌ GOOGLE_PLACES_API_KEY missing in .env");
  process.exit(1);
}

// Center of Kathmandu Valley (approx. coordinates)
const KATHMANDU_CENTER = { lat: 27.7172, lng: 85.3240 };
const RADIUS = 10000; // 10km radius in meters

// Categories to search for (mapped to Google Places types)
const categories = [
  { type: "hindu_temple", category: "Temple" },
  { type: "tourist_attraction", category: "Attraction" },
  { type: "market", category: "Attraction" }, // Changed "Market" to "Attraction"
  { type: "park", category: "Park" },
  { type: "cafe", category: "Cafe" },
  { type: "museum", category: "Museum" },
];

async function fetchPlaces(type, category) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${KATHMANDU_CENTER.lat},${KATHMANDU_CENTER.lng}&radius=${RADIUS}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`Error fetching ${type}: ${data.status} - ${data.error_message || "No error message provided"}`);
      return [];
    }

    return data.results.map((place) => ({
      name: place.name,
      description: place.vicinity || "A popular destination in Kathmandu Valley.",
      location: {
        type: "Point",
        coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      },
      category: category,
      placeId: place.place_id,
      image: place.photos ? place.photos[0].photo_reference : null,
    }));
  } catch (err) {
    console.error(`Network error fetching ${type}: ${err.message}`);
    return [];
  }
}

async function fetchPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=editorial_summary,photos,rating&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`Error fetching details for ${placeId}: ${data.status} - ${data.error_message || "No error message provided"}`);
      return { description: null, image: null, rating: null };
    }

    const result = data.result;
    const photoRef = result.photos && result.photos[0] ? result.photos[0].photo_reference : null;
    const imageUrl = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photoRef}&key=${GOOGLE_PLACES_API_KEY}`
      : null;

    return {
      description: result.editorial_summary ? result.editorial_summary.overview : null,
      image: imageUrl,
      rating: result.rating || null,
    };
  } catch (err) {
    console.error(`Network error fetching details for ${placeId}: ${err.message}`);
    return { description: null, image: null, rating: null };
  }
}

async function fetchNearbyPlaces(coordinates) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates[1]},${coordinates[0]}&radius=5000&type=tourist_attraction&key=${GOOGLE_PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      console.error(`Error fetching nearby places: ${data.status} - ${data.error_message || "No error message provided"}`);
      return [];
    }

    return data.results.slice(0, 3).map((place) => ({
      _id: new mongoose.Types.ObjectId(),
      name: place.name,
      category: "Attraction",
      image: place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        : null,
    }));
  } catch (err) {
    console.error(`Network error fetching nearby places: ${err.message}`);
    return [];
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await RecommendedPlace.deleteMany();
    await Place.deleteMany();
    console.log("🗑️ Cleared old data");

    const allPlaces = [];
    for (const { type, category } of categories) {
      const places = await fetchPlaces(type, category);
      console.log(`Fetched ${places.length} places of type ${type}`);
      allPlaces.push(...places);
    }

    const placesWithDetails = await Promise.all(
      allPlaces.map(async (place) => {
        const details = await fetchPlaceDetails(place.placeId);
        return {
          ...place,
          description: details.description || place.description,
          image: details.image || place.image,
          rating: details.rating || (Math.random() * (5 - 4) + 4).toFixed(1),
        };
      })
    );

    const savedPlaces = [];
    for (const place of placesWithDetails) {
      const newPlace = await Place.create({
        name: place.name,
        description: place.description,
        location: place.location,
        category: place.category,
        image: place.image || "https://via.placeholder.com/600x400?text=" + encodeURIComponent(place.name),
        addedBy: new mongoose.Types.ObjectId(),
      });
      savedPlaces.push(newPlace);
      console.log(`Added Place: ${place.name}`);
    }

    for (let i = 0; i < savedPlaces.length; i++) {
      const place = savedPlaces[i];
      const nearbyPlaces = await fetchNearbyPlaces(place.location.coordinates);
      await RecommendedPlace.create({
        place: place._id,
        order: i + 1,
        title: place.name,
        shortDescription: place.description.split(".")[0] + ".",
        image: place.image,
        rating: place.rating,
        nearbyPlaces: nearbyPlaces,
      });
      console.log(`Seeded RecommendedPlace: ${place.name} with ${nearbyPlaces.length} nearby places`);
    }

    console.log("✅ All done!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();