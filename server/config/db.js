// config/db.js
const mongoose = require("mongoose");
require("dotenv").config();       // 1) load .env

const uri = process.env.MONGO_URI 
           || "mongodb://127.0.0.1:27017/TravelGuideApp";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);   // 2) pass uri, no options needed
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
