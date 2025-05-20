const { createClient } = require("redis");
const client = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });
client.on("error", console.error);
client.connect();

async function saveOtp(email, otp) {
  // store with 10‑minute TTL
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
