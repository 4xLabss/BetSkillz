import mongoose from 'mongoose';

// Retrieve the MongoDB connection string from environment variables.
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    'Please define the MONGO_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If a connection is already cached, return it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise is not cached, create one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection promise and cache the connection object.
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, reset the promise and re-throw the error.
    cached.promise = null;
    throw e;
  }

  // Return the established connection.
  return cached.conn;
}

export default dbConnect;
