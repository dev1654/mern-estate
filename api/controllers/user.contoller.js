import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.send("Test route being called!!!");
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only update your own account!"));
  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
          phone: req.body.phone,
          bio: req.body.bio,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted...");
  } catch (error) {
    next(error);
  }
};

export const getUserListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only view your own listings!"));
  try {
    const listings = await Listing.find({ userRef: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, "User not found!"));
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const toggleSavedListing = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const listingId = req.params.listingId;
    const isSaved = user.savedListings.includes(listingId);

    if (isSaved) {
      user.savedListings = user.savedListings.filter((id) => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }

    await user.save();
    res.status(200).json({ savedListings: user.savedListings, saved: !isSaved });
  } catch (error) {
    next(error);
  }
};

export const getSavedListings = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "Not authorized"));
  try {
    const user = await User.findById(req.params.id).populate("savedListings");
    res.status(200).json(user.savedListings);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "Not authorized"));
  try {
    const listings = await Listing.find({ userRef: req.params.id });
    const totalViews = listings.reduce((acc, l) => acc + (l.views || 0), 0);
    const totalListings = listings.length;
    const activeListings = listings.filter((l) => l.status === "active").length;
    const user = await User.findById(req.params.id);
    res.status(200).json({
      totalListings,
      activeListings,
      totalViews,
      savedListings: user.savedListings.length,
    });
  } catch (error) {
    next(error);
  }
};
