import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { createReview, getReviews, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createReview);
router.get("/:listingId", getReviews);
router.delete("/:id", verifyToken, deleteReview);

export default router;
