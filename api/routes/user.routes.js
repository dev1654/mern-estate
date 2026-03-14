import express from "express";
import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
  toggleSavedListing,
  getSavedListings,
  getDashboardStats,
} from "../controllers/user.contoller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);
router.get("/saved/:id", verifyToken, getSavedListings);
router.post("/saved/toggle/:listingId", verifyToken, toggleSavedListing);
router.get("/stats/:id", verifyToken, getDashboardStats);
router.get("/:id", verifyToken, getUser);

export default router;
