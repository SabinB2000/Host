const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash('admin123', 10);

    const result = await User.updateOne(
      { email: 'admin@guidenepal.com' },
      { $set: { password: hashed } }
    );

    console.log('✅ Admin password reset to: admin123');
    console.log(result);
    process.exit();
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    process.exit(1);
  }
};

resetPassword();
