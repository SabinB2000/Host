// seedPlaces.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Place = require("./models/Place");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const uniquePlaces = [
  {
    name: "Pashupatinath Temple",
    description: "Sacred Hindu temple on the banks of the Bagmati River.",
    category: "religious",
    location: { lat: 27.7105, lng: 85.3488 },
    mainAttraction: true,
  },
  {
    name: "Boudhanath Stupa",
    description: "One of the largest spherical stupas in the world.",
    category: "religious",
    location: { lat: 27.7215, lng: 85.3620 },
    mainAttraction: true,
  },
  {
    name: "Swayambhunath (Monkey Temple)",
    description: "Ancient stupa with panoramic views of Kathmandu.",
    category: "religious",
    location: { lat: 27.7149, lng: 85.2906 },
    mainAttraction: true,
  },
  {
    name: "Thamel",
    description: "Lively tourist hub with shops, cafes, and nightlife.",
    category: "cultural",
    location: { lat: 27.7149, lng: 85.3131 },
    mainAttraction: true,
  },
  {
    name: "Patan Durbar Square",
    description: "Historic royal palace with museums and architecture.",
    category: "cultural",
    location: { lat: 27.6710, lng: 85.3250 },
    mainAttraction: true,
  },
  {
    name: "Bhaktapur Durbar Square",
    description: "Medieval city known for traditional art and architecture.",
    category: "cultural",
    location: { lat: 27.6724, lng: 85.4279 },
    mainAttraction: true,
  },
  {
    name: "Nagarkot",
    description: "Scenic hill station known for sunrise and Himalaya views.",
    category: "scenic",
    location: { lat: 27.7154, lng: 85.5200 },
    mainAttraction: true,
  },
  {
    name: "Pokhara (Lakeside)",
    description: "Gateway to Annapurna with boating and Phewa Lake.",
    category: "adventure",
    location: { lat: 28.2096, lng: 83.9856 },
    mainAttraction: true,
  },
  {
    name: "Sarangkot",
    description: "Famous viewpoint for sunrise and paragliding.",
    category: "adventure",
    location: { lat: 28.2438, lng: 83.9626 },
    mainAttraction: true,
  },
  {
    name: "Lumbini",
    description: "Birthplace of Gautama Buddha.",
    category: "religious",
    location: { lat: 27.4712, lng: 83.2750 },
    mainAttraction: true,
  },
  {
    name: "Chitwan National Park",
    description: "Wildlife safari destination with rhinos and tigers.",
    category: "nature",
    location: { lat: 27.5342, lng: 84.5058 },
    mainAttraction: true,
  },
  {
    name: "Rara Lake",
    description: "Remote alpine lake in the Himalayas.",
    category: "scenic",
    location: { lat: 29.5290, lng: 82.0964 },
    mainAttraction: true,
  },
];

async function seed() {
  try {
    await Place.deleteMany({});
    await Place.insertMany(uniquePlaces); // ✅ Fixed this line
    console.log("✅ Places seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();
