import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));
  if (req.user.id !== listing.userRef)
    return next(errorHandler(403, "You can only delete your own listings"));
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted!");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(errorHandler(404, "Listing not found"));
  if (req.user.id !== listing.userRef)
    return next(errorHandler(403, "You can only update your own listings"));
  try {
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!listing) return next(errorHandler(404, "Listing not found!"));
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    // Build filter only for fields explicitly requested
    const filter = {};
    filter.name = { $regex: searchTerm, $options: "i" };

    // type
    const type = req.query.type;
    filter.type = (!type || type === "all") ? { $in: ["sale", "rent"] } : type;

    // booleans — only filter when explicitly set to "true"
    if (req.query.offer === "true") filter.offer = true;
    if (req.query.furnished === "true") filter.furnished = true;
    if (req.query.parking === "true") filter.parking = true;
    if (req.query.pool === "true") filter.pool = true;
    if (req.query.petFriendly === "true") filter.petFriendly = true;
    if (req.query.featured === "true") filter.featured = true;

    // propertyType
    if (req.query.propertyType && req.query.propertyType !== "all") {
      filter.propertyType = req.query.propertyType;
    }

    // price range
    const minPrice = parseInt(req.query.minPrice) || 0;
    const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
    filter.regularPrice = { $gte: minPrice, $lte: maxPrice };

    // status — include listings with no status field (old data)
    filter.$or = [{ status: "active" }, { status: { $exists: false } }, { status: null }];

    const listings = await Listing.find(filter)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ featured: true, status: { $in: ["active", null, undefined, ""] } })
      .sort({ createdAt: -1 })
      .limit(6);
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const getListingStats = async (req, res, next) => {
  try {
    const statusFilter = { status: { $in: ["active", null, undefined, ""] } };
    const totalListings = await Listing.countDocuments(statusFilter);
    const forSale = await Listing.countDocuments({ type: "sale", ...statusFilter });
    const forRent = await Listing.countDocuments({ type: "rent", ...statusFilter });
    const withOffer = await Listing.countDocuments({ offer: true, ...statusFilter });
    res.status(200).json({ totalListings, forSale, forRent, withOffer });
  } catch (error) {
    next(error);
  }
};
