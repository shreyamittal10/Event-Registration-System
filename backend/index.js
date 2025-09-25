import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pkg from "pg";
import cors from "cors";

import { register, login } from "./controllers/authController.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import {
  createEvent,
  getCreatedEvents,
  getAllEvents,
  registerForEvent,
  getEventDetails,
  deleteEvent, 
  getRegisteredEvents
} from "./controllers/eventController.js";
import { getMyProfile } from "./controllers/userController.js";

const { Pool } = pkg;
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.error("❌ DB error:", err));

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ msg: `Hello ${req.user.role}, you are authorized!` });
});

app.post("/api/events/create", verifyToken, createEvent);
app.get("/api/events/created", verifyToken, getCreatedEvents);
app.get("/api/events/all", verifyToken, getAllEvents);
app.post("/api/events/register", verifyToken, registerForEvent);
app.get("/api/events/registered", verifyToken, getRegisteredEvents);
app.get("/api/events/:id", verifyToken, getEventDetails); 
app.delete("/api/events/:id", verifyToken, deleteEvent); 

app.get("/api/users/me", verifyToken, getMyProfile);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { pool };
