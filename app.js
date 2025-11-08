import express from "express";
const app = express();

// Middleware
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! Product Management Server is running.");
});

export default app;
