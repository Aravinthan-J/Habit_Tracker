/**
 * Minimal Express server for Render deployment
 * No TypeScript, no compilation - just pure JavaScript
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Habit Tracker API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      habits: "/api/habits",
      completions: "/api/completions",
    },
  });
});

// Basic auth endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Simple user creation (without bcrypt for now)
    const user = await prisma.user.create({
      data: { email, password, name },
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
