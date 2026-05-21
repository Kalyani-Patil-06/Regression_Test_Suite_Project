const connectDB = async () => {
  console.log('⏳ Starting Lightweight In-Memory Mock Database...');
  console.log(`✅ In-Memory DB Ready! (Zero dependencies, Zero OOM crashes)`);
};

const disconnectDB = async () => {
  console.log('Database disconnected.');
};

module.exports = { connectDB, disconnectDB };
