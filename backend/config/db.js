const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iem_admissions', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[MongoDB Warning] Please ensure MongoDB service is running (e.g., mongod or Docker container or MongoDB Atlas URI in .env).`);
  }
};

module.exports = connectDB;
