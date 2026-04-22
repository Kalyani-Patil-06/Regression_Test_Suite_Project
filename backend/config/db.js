const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    // Use in-memory MongoDB (no installation needed)
    console.log('⏳ Starting in-memory MongoDB server...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Connected: ${uri}`);
    console.log('   (Data will reset when server stops — perfect for demo/testing)\n');
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { connectDB, disconnectDB };
