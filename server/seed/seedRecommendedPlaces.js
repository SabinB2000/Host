const mongoose = require("mongoose");
const RecommendedPlace = require("../models/RecommendedPlace");
const Place = require("../models/Place");
const connectDB = require("../config/db");

connectDB();

const seedRecommendedPlaces = async () => {
  try {
    await RecommendedPlace.deleteMany();
    await Place.deleteMany();

    const places = await Place.insertMany([
      {
        name: "Pashupatinath Temple",
        description: "A sacred Hindu temple complex.",
        location: { type: "Point", coordinates: [85.348, 27.710] },
        category: "Temple",
      },
      {
        name: "Boudhanath Stupa",
        description: "A UNESCO World Heritage Site.",
        location: { type: "Point", coordinates: [85.362, 27.715] },
        category: "Stupa",
      },
      {
        name: "Swayambhunath",
        description: "The Monkey Temple with panoramic views.",
        location: { type: "Point", coordinates: [85.290, 27.715] },
        category: "Temple",
      },
    ]);

    await RecommendedPlace.insertMany([
      {
        place: places[0]._id,
        order: 1,
        title: "Pashupatinath Temple",
        shortDescription: "A sacred Hindu temple complex on the Bagmati River.",
        image: "https://images.unsplash.com/photo-1594219748939-6a1f7e64c88f",
        rating: 4.8,
      },
      {
        place: places[1]._id,
        order: 2,
        title: "Boudhanath Stupa",
        shortDescription: "One of the largest stupas in the world, a UNESCO site.",
        image: "https://images.unsplash.com/photo-1583427571477-4e645d3093c6",
        rating: 4.7,
      },
      {
        place: places[2]._id,
        order: 3,
        title: "Swayambhunath",
        shortDescription: "The Monkey Temple with panoramic views of Kathmandu.",
        image: "https://images.unsplash.com/photo-1594219748939-6a1f7e64c88f",
        rating: 4.6,
      },
    ]);

    console.log("Recommended places seeded!");
    process.exit();
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedRecommendedPlaces();