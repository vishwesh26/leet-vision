const mongoose = require('mongoose');

/**
 * MongoDB Singleton Connection Utility
 * Ensures that a single Mongoose connection is shared across all modules
 * and persisted during serverless warm starts.
 */

let cachedConnection = null;

const connectDB = async () => {
    // If we already have a connection, return it
    if (mongoose.connection.readyState >= 1) {
        return mongoose.connection;
    }

    // If we have a cached connection promise, wait for it
    if (cachedConnection) {
        return cachedConnection;
    }

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.warn("MONGODB_URI is not defined in environment variables. Falling back to session-only mode.");
        return null;
    }

    const options = {
        maxPoolSize: process.env.VERCEL ? 3 : 10, // Optimize pool size for Vercel serverless to avoid connection exhaustion
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
    };

    try {
        console.log("Creating new MongoDB connection pulse...");
        cachedConnection = mongoose.connect(MONGODB_URI, options);
        
        const conn = await cachedConnection;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error('MongoDB runtime error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Re-attempting connection on next request.');
            cachedConnection = null;
        });

        return conn;
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        cachedConnection = null; // Reset cache so we can try again
        throw error;
    }
};

module.exports = connectDB;
