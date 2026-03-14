import Review from "../models/review.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createReview = async (req, res, next) => {
  try {
    const { listingId, rating, comment } = req.body;
    const existing = await Review.findOne({ listing: listingId, user: req.user.id });
    if (existing) return next(errorHandler(400, "You already reviewed this listing"));

    const review = await Review.create({
      listing: listingId,
      user: req.user.id,
      rating,
      comment,
    });

    // Update listing avg rating
    const reviews = await Review.find({ listing: listingId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Listing.findByIdAndUpdate(listingId, {
      avgRating: Math.round(avg * 10) / 10,
      numReviews: reviews.length,
    });

    const populated = await review.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return next(errorHandler(404, "Review not found"));
    if (review.user.toString() !== req.user.id)
      return next(errorHandler(403, "You can only delete your own reviews"));

    await Review.findByIdAndDelete(req.params.id);

    const reviews = await Review.find({ listing: review.listing });
    const avg = reviews.length
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
    await Listing.findByIdAndUpdate(review.listing, {
      avgRating: Math.round(avg * 10) / 10,
      numReviews: reviews.length,
    });

    res.status(200).json("Review deleted");
  } catch (error) {
    next(error);
  }
};
