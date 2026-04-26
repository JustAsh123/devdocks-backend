import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { pool } from "./db.js";
import cors from "cors";
import tokenValidatior from "./middlewares/tokenValidator.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoute.js";
import tasksRoutes from "./routes/tasksRouter.js";
import documentRoutes from "./routes/documentRouter.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.get("/", tokenValidatior, (req, res) => {
  res.json({ success: true, data: req.user });
});

app.use("/users", userRoutes);
app.use("/projects", tokenValidatior, projectRoutes);
app.use("/tasks", tokenValidatior, tasksRoutes);
app.use("/documents", tokenValidatior, documentRoutes);

// Global error handler — catches errors thrown/passed from async route handlers
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  if (pool) {
    console.log("Connected to database");
  } else {
    console.log("Failed to connect to database");
  }
});
