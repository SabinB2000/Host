// generateHash.js
const bcrypt = require("bcryptjs");

async function main() {
  const plaintextPassword = "Admin@123"; // Your admin password
  const saltRounds = 10;
  const hash = await bcrypt.hash(plaintextPassword, saltRounds);
  console.log("Hashed password:", hash);
}

main();
