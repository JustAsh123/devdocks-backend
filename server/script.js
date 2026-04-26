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
app.use(cors());

app.get("/", tokenValidatior, (req, res) => {
  res.json({ success: true, data: req.user });
});

app.use("/users", userRoutes);
app.use("/projects", tokenValidatior, projectRoutes);
app.use("/tasks", tokenValidatior, tasksRoutes);
app.use("/documents", tokenValidatior, documentRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  if (pool) {
    console.log("Connected to database");
  } else {
    console.log("Failed to connect to database");
  }
});
