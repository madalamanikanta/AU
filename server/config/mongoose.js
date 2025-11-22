const mongoose = require('mongoose')

/**
 * Connect to MongoDB using MONGO_URI from environment.
 * Usage: const connect = require('./config/mongoose'); await connect();
 */
module.exports = async function connectMongo() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI not set')
  // return the promise so caller can await
  return mongoose.connect(uri)
}
