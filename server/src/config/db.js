const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocklite';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n======================================================`);
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.error(`Attempted URI: ${uri}`);
    console.error(`\nTroubleshooting tips:`);
    console.error(`1. If using local MongoDB, ensure the MongoDB service or mongod process is running.`);
    console.error(`   Run in terminal: net start MongoDB (as Admin) or start mongod.exe`);
    console.error(`2. If using MongoDB Atlas, check your connection string in server/.env`);
    console.error(`   and verify that your current IP address is whitelisted in Atlas Network Access.`);
    console.error(`======================================================\n`);
    return null;
  }
};

module.exports = connectDB;
