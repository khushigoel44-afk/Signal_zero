const mongoose = require("mongoose");

const connectDB = async (uri, maxRetries = 5, delayMs = 2500) => {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      return conn;
    } catch (error) {
      retries += 1;
      if (retries > maxRetries) {
        throw new Error(`MongoDB connection failed after retries: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

module.exports = connectDB;
