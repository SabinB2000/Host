const mongoose = require("mongoose");
const { createClient } = require("redis");
require("dotenv").config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI not set in environment");
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.REDIS_URL) {
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", console.error);
  client.connect();

  module.exports = {
    connectDB,
    saveOtp: async (email, otp) => {
      await client.set(`otp:${email}`, otp, { EX: 600 });
    },
    verifyOtp: async (email, otp) => {
      const stored = await client.get(`otp:${email}`);
      if (stored === otp) {
        await client.del(`otp:${email}`);
        return true;
      }
      return false;
    },
  };
} else {
  console.warn("⚠️  Redis disabled (no REDIS_URL) – OTP functions will no-op.");
  module.exports = {
    connectDB,
    saveOtp: async () => {},
    verifyOtp: async () => false,
  };
}

module.exports = connectDB;
