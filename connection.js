const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URI;

exports.connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB Connected", MONGO_URL);
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};
