import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    // New fields
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["user", "agent", "admin"], default: "user" },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
