const mongoose = require('mongoose');
const dns = require('dns');

// Node.js on Windows can default to 127.0.0.1 as DNS resolver, which cannot
// resolve MongoDB Atlas SRV records.  Override with reliable public resolvers.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined. Create a .env file with MONGO_URI=mongodb://localhost:27017/teacher-student');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
