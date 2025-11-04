import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import meetingRouter from "./routes/meetings";
import userRouter from "./routes/user";
import authMiddleware from "./middleware/auth";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Simple health
app.get("/", (req, res) => res.json({ ok: true }));

// Auth: a simple route to get a token for testing (in production you'd have users)
app.post("/token", (req, res) => {
  // For simplicity allow a "username" in body, issue token
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "username required" });
  // Create JWT (expires in 7d)
  const token = jwt.sign({ username }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
  res.json({ token });
});

app.use("/users", userRouter(prisma));

// Protected meetings endpoints
app.use("/meetings", authMiddleware, meetingRouter(prisma));

// Swagger docs (persist auth so token stays between calls)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } })
);
app.get("/docs.json", (req, res) => res.json(swaggerSpec));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
