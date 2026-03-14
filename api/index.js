import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import cors from "cors";

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js";
import listingRouter from "./routes/listing.routes.js";
import reviewRouter from "./routes/review.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import conversationRouter from "./routes/conversation.routes.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err));

const __dirname = path.resolve();
const app = express();

// Security & performance middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled so frontend assets load
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
app.use("/api/auth/signin", authLimiter);
app.use("/api/auth/signup", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/review", reviewRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/conversation", conversationRouter);

// Serve frontend in production
app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({ success: false, statusCode, message });
});

app.listen(3000, () => console.log("Server running on port 3000"));
