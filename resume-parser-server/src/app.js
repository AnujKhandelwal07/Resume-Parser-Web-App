require("dotenv").config();
const express = require("express");
const cors = require("cors");

const resumeRoutes = require("./routes/resumeRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Improved CORS Configuration (Restrict origins)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// Middleware (Order Matters)
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses form data

// API Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/profile", profileRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
