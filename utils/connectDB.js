import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    // Check if currently connecting
    if (mongoose.connection.readyState === 2) {
      console.log("MongoDB connection in progress...");
      return;
    }

    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/product_management";

    const conn = await mongoose.connect(mongoURI, {
      // Modern Mongoose doesn't need these options, but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
