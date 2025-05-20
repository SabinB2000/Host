require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { createClient } = require("pexels");
const RecommendedPlace = require("../models/RecommendedPlace");

const PEXELS_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_KEY) {
  console.error("❌ PEXELS_API_KEY missing in .env");
  process.exit(1);
}
const pexels = createClient(PEXELS_KEY);

// load your JSON
const places = JSON.parse(
  fs.readFileSync(path.join(__dirname, "kathmanduPlaces.json"))
);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (let p of places) {
      // search Pexels for a matching photo
      const { photos } = await pexels.photos.search({
        query: `${p.name} Nepal`,
        per_page: 1,
      });

      // pick the first photo or a placeholder
      const imageUrl =
        (photos[0] && photos[0].src.large) ||
        `https://via.placeholder.com/600x400?text=${encodeURIComponent(
          p.name
        )}`;

      // upsert into Mongo
      await RecommendedPlace.findOneAndUpdate(
        { name: p.name },
        { ...p, imageUrl },
        { upsert: true, new: true }
      );

      console.log(`Seeded: ${p.name}`);
    }

    console.log("✅ All done!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
