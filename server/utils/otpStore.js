const { createClient } = require("redis");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error("❌ REDIS_URL not set in environment");
  process.exit(1);
}

const client = createClient({ url: REDIS_URL });
client.on("error", err => console.error("Redis Client Error:", err));
client.connect();

async function saveOtp(email, otp) {
  await client.set(`otp:${email}`, otp, { EX: 600 });
}

async function verifyOtp(email, otp) {
  const stored = await client.get(`otp:${email}`);
  if (stored === otp) {
    await client.del(`otp:${email}`);
    return true;
  }
  return false;
}

module.exports = { saveOtp, verifyOtp };
