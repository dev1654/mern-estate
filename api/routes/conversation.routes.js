import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  getOrCreateConversation,
  sendMessage,
  getMyConversations,
  getConversation,
  getUnreadCount,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/", verifyToken, getOrCreateConversation);
router.get("/", verifyToken, getMyConversations);
router.get("/unread", verifyToken, getUnreadCount);
router.get("/:id", verifyToken, getConversation);
router.post("/:id/message", verifyToken, sendMessage);

export default router;
