import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./utils/index.js";
import { userRoutes, productRoutes } from "./routes/index.js";

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/products", productRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Product Management Server is running.");
});

export default app;
