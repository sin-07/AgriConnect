import mongoose from "mongoose";
import dns from "dns";

// Force IPv4-first DNS resolution – fixes querySrv ECONNREFUSED on restrictive networks
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/agriconnect";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,          // force IPv4 – avoids SRV ECONNREFUSED on IPv6-broken networks
    }).then((m) => {
      console.log("MongoDB Connected");
      return m;
    });
  }

  cached.conn = await cached.promise.catch((err) => {
    // Reset so the next request retries the connection
    cached.promise = null;
    throw err;
  });
  return cached.conn;
}

export default connectDB;
