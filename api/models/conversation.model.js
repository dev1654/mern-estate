import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    messages: [messageSchema],
    lastMessage: { type: String, default: "" },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One conversation per pair of users per listing
conversationSchema.index({ participants: 1, listing: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
