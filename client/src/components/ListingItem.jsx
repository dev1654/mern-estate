import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { MapPin, Bed, Bath, Square, Heart, Eye, Star, TrendingDown, Home as HomeIcon } from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice, formatNumber, cn } from "../lib/utils";

const TYPE_COLORS = {
  house: "bg-blue-100 text-blue-700",
  apartment: "bg-purple-100 text-purple-700",
  condo: "bg-indigo-100 text-indigo-700",
  villa: "bg-amber-100 text-amber-700",
  townhouse: "bg-teal-100 text-teal-700",
  studio: "bg-pink-100 text-pink-700",
  commercial: "bg-slate-100 text-slate-700",
  land: "bg-green-100 text-green-700",
};

export default function ListingItem({ listing }) {
  const { currentUser } = useSelector((s) => s.user);
  const [saved, setSaved] = useState(currentUser?.savedListings?.includes(listing._id));
  const [loading, setLoading] = useState(false);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Sign in to save listings"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/user/saved/toggle/${listing._id}`, { method: "POST", credentials: "include" });
      const data = await res.json();
      setSaved(data.saved);
      toast.success(data.saved ? "Saved!" : "Removed from saved");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const discount = listing.offer && listing.discountPrice > 0
    ? Math.round(((listing.regularPrice - listing.discountPrice) / listing.regularPrice) * 100)
    : 0;

  return (
    <Link to={`/listing/${listing._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ paddingTop: "66%" }}>
          <img
            src={listing.imageUrls?.[0] || "https://placehold.co/400x300?text=No+Image"}
            alt={listing.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm text-white",
              listing.type === "rent" ? "bg-emerald-500" : "bg-blue-600")}>
              {listing.type === "rent" ? "For Rent" : "For Sale"}
            </span>
            {discount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm">
                <TrendingDown size={10} /> {discount}% off
              </span>
            )}
          </div>

          {/* Top-right: property type */}
          {listing.propertyType && (
            <div className="absolute top-3 right-3">
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize shadow-sm",
                TYPE_COLORS[listing.propertyType] || "bg-slate-100 text-slate-700")}>
                <HomeIcon size={10} />
                {listing.propertyType}
              </span>
            </div>
          )}

          {/* Save button */}
          <button onClick={handleToggleSave} disabled={loading}
            className={cn("absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all",
              saved ? "bg-red-500 text-white" : "bg-white/90 text-slate-500 hover:bg-red-50 hover:text-red-500 backdrop-blur-sm")}>
            <Heart size={14} className={saved ? "fill-current" : ""} />
          </button>

          {/* Views */}
          {listing.views > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              <Eye size={11} /> {formatNumber(listing.views)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
            {listing.name}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
            <MapPin size={13} className="flex-shrink-0 text-blue-500" />
            <span className="line-clamp-1">{listing.address}</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mb-3">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(listing.offer && listing.discountPrice > 0 ? listing.discountPrice : listing.regularPrice, listing.type)}
            </span>
            {listing.offer && listing.discountPrice > 0 && (
              <span className="text-sm text-slate-400 line-through pb-0.5">
                {formatPrice(listing.regularPrice, listing.type)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-slate-500 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Bed size={13} className="text-slate-400" />
              <span className="font-medium text-slate-700">{listing.bedrooms}</span> bed
            </span>
            <span className="flex items-center gap-1">
              <Bath size={13} className="text-slate-400" />
              <span className="font-medium text-slate-700">{listing.bathrooms}</span> bath
            </span>
            {listing.squareFeet > 0 && (
              <span className="flex items-center gap-1 ml-auto">
                <Square size={12} className="text-slate-400" />
                <span className="font-medium text-slate-700">{formatNumber(listing.squareFeet)}</span>
                <span className="text-slate-400">sqft</span>
              </span>
            )}
            {listing.avgRating > 0 && (
              <span className="flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="font-medium text-slate-700">{listing.avgRating}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
