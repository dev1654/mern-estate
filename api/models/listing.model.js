import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    regularPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true, default: 0 },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    furnished: { type: Boolean, required: true },
    parking: { type: Boolean, required: true },
    type: { type: String, required: true, enum: ["sale", "rent"] },
    offer: { type: Boolean, required: true, default: false },
    imageUrls: { type: Array, required: true },
    userRef: { type: String, required: true },

    // New fields
    propertyType: {
      type: String,
      enum: ["house", "apartment", "condo", "townhouse", "villa", "studio", "commercial", "land"],
      default: "house",
    },
    squareFeet: { type: Number, default: 0 },
    yearBuilt: { type: Number, default: null },
    garage: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "sold", "rented", "pending"],
      default: "active",
    },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ name: "text", description: "text", address: "text" });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
