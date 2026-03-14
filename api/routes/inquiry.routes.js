import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { sendInquiry, getMyInquiries, markInquiryRead } from "../controllers/inquiry.controller.js";

const router = express.Router();

router.post("/send", verifyToken, sendInquiry);
router.get("/mine", verifyToken, getMyInquiries);
router.patch("/:id/read", verifyToken, markInquiryRead);

export default router;
