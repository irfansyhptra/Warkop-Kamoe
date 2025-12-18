import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Only throw error at runtime, not during build
if (!MONGODB_URI && process.env.NODE_ENV !== "production") {
  console.warn(
    "Warning: MONGODB_URI is not defined. Using dummy connection for build."
  );
}

interface GlobalWithMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare global {
  var mongoose:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

let cached = (global as GlobalWithMongoose).mongoose;

if (!cached) {
  cached = (global as GlobalWithMongoose).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect(retries = 3, delay = 2000) {
  // Throw error only at runtime when actually trying to connect
  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    cached.promise = (async () => {
      let lastError;
      
      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempting MongoDB connection (${i + 1}/${retries})...`);
          const connection = await mongoose.connect(MONGODB_URI!, opts);
          console.log("✅ MongoDB connected successfully");
          return connection;
        } catch (error) {
          lastError = error;
          console.error(`❌ MongoDB connection attempt ${i + 1} failed:`, error instanceof Error ? error.message : error);
          
          // Don't retry on authentication errors or invalid URI
          if (error instanceof Error && (
            error.message.includes("authentication") ||
            error.message.includes("Invalid connection string")
          )) {
            throw error;
          }
          
          // Wait before retry (except on last attempt)
          if (i < retries - 1) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed
      throw new Error(
        `Failed to connect to MongoDB after ${retries} attempts. ` +
        `Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}. ` +
        `Please check: 1) MongoDB Atlas IP whitelist, 2) Connection string, 3) Network connectivity`
      );
    })();
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset promise so next call will retry
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
export { dbConnect as connectDB };
