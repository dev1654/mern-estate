import Conversation from "../models/conversation.model.js";
import { errorHandler } from "../utils/error.js";

// Start or get existing conversation
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, listingId } = req.body;
    const me = req.user.id;

    if (me === recipientId) return next(errorHandler(400, "Cannot message yourself"));

    // Look for existing conversation between these two users for this listing
    let conv = await Conversation.findOne({
      participants: { $all: [me, recipientId] },
      listing: listingId || null,
    })
      .populate("participants", "username avatar email")
      .populate("listing", "name imageUrls address type regularPrice");

    if (!conv) {
      conv = await Conversation.create({
        participants: [me, recipientId],
        listing: listingId || null,
        messages: [],
      });
      conv = await Conversation.findById(conv._id)
        .populate("participants", "username avatar email")
        .populate("listing", "name imageUrls address type regularPrice");
    }

    res.status(200).json(conv);
  } catch (error) {
    next(error);
  }
};

// Send a message in a conversation
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const conv = await Conversation.findById(req.params.id);
    if (!conv) return next(errorHandler(404, "Conversation not found"));

    const isParticipant = conv.participants.some((p) => p.toString() === req.user.id);
    if (!isParticipant) return next(errorHandler(403, "Not authorized"));

    const message = { sender: req.user.id, content, read: false };
    conv.messages.push(message);
    conv.lastMessage = content;
    conv.lastUpdated = new Date();
    await conv.save();

    // Return just the new message populated
    const updated = await Conversation.findById(conv._id)
      .populate("messages.sender", "username avatar")
      .populate("participants", "username avatar email")
      .populate("listing", "name imageUrls address type regularPrice");

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// Get all conversations for current user
export const getMyConversations = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id })
      .populate("participants", "username avatar email")
      .populate("listing", "name imageUrls address type regularPrice")
      .sort({ lastUpdated: -1 });

    res.status(200).json(convs);
  } catch (error) {
    next(error);
  }
};

// Get single conversation with all messages
export const getConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate("messages.sender", "username avatar")
      .populate("participants", "username avatar email")
      .populate("listing", "name imageUrls address type regularPrice");

    if (!conv) return next(errorHandler(404, "Conversation not found"));

    const isParticipant = conv.participants.some((p) => p._id.toString() === req.user.id);
    if (!isParticipant) return next(errorHandler(403, "Not authorized"));

    // Mark all messages from the other person as read
    let changed = false;
    conv.messages.forEach((m) => {
      if (m.sender._id.toString() !== req.user.id && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) await conv.save();

    res.status(200).json(conv);
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  try {
    const convs = await Conversation.find({ participants: req.user.id });
    let count = 0;
    for (const conv of convs) {
      for (const msg of conv.messages) {
        if (msg.sender.toString() !== req.user.id && !msg.read) count++;
      }
    }
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};
