const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error('MongoDB connection failed ❌');
      console.error('Missing env: set MONGODB_URI (or legacy MONGO_URI)');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB connection failed ❌");
    process.exit(1);
  }
};

module.exports = connectDB;
