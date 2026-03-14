import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css/bundle";
import { useSelector } from "react-redux";
import {
  MapPin, Bed, Bath, Car, Sofa, Square, Calendar, Eye,
  Share2, Heart, Star, Check, X, ChevronRight, Home as HomeIcon,
  Waves, PawPrint, MessageSquare, TrendingDown,
} from "lucide-react";
import Contact from "../components/Contact";
import MortgageCalculator from "../components/MortgageCalculator";
import ReviewSection from "../components/ReviewSection";
import { formatPrice, formatNumber, timeAgo, cn } from "../lib/utils";
import toast from "react-hot-toast";

export default function Listing() {
  const { listingId } = useParams();
  const { currentUser } = useSelector((s) => s.user);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) { setError(true); setLoading(false); return; }
        setListing(data);
        setSaved(currentUser?.savedListings?.includes(data._id));
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = async () => {
    if (!currentUser) { toast.error("Sign in to save listings"); return; }
    try {
      const res = await fetch(`/api/user/saved/toggle/${listing._id}`, { method: "POST", credentials: "include" });
      const data = await res.json();
      setSaved(data.saved);
      toast.success(data.saved ? "Saved!" : "Removed from saved");
    } catch { toast.error("Something went wrong"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500">Loading property...</p>
      </div>
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <X size={48} className="mx-auto text-red-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Property not found</h2>
        <Link to="/search" className="text-blue-600 mt-2 inline-block hover:underline">Browse listings</Link>
      </div>
    </div>
  );

  const discount = listing.offer && listing.discountPrice > 0
    ? Math.round(((listing.regularPrice - listing.discountPrice) / listing.regularPrice) * 100)
    : 0;

  const displayPrice = listing.offer && listing.discountPrice > 0 ? listing.discountPrice : listing.regularPrice;

  const TABS = ["overview", "features", "reviews", "calculator"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/search" className="hover:text-blue-600 transition-colors">Listings</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium truncate max-w-xs">{listing.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="h-[380px] md:h-[460px]"
                >
                  {listing.imageUrls.map((url, i) => (
                    <SwiperSlide key={i}>
                      <img src={url} alt={`${listing.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow",
                    listing.type === "rent" ? "bg-emerald-500" : "bg-blue-600")}>
                    {listing.type === "rent" ? "For Rent" : "For Sale"}
                  </span>
                  {discount > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow">
                      <TrendingDown size={12} /> {discount}% off
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button onClick={handleShare} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                    <Share2 size={15} className="text-slate-600" />
                  </button>
                  <button onClick={handleToggleSave} className={cn("w-9 h-9 rounded-full flex items-center justify-center shadow transition-colors",
                    saved ? "bg-red-500" : "bg-white/90 backdrop-blur-sm hover:bg-white")}>
                    <Heart size={15} className={saved ? "text-white fill-white" : "text-slate-600"} />
                  </button>
                </div>

                {/* Views */}
                {listing.views > 0 && (
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                    <Eye size={12} /> {formatNumber(listing.views)} views
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.imageUrls.length > 1 && (
                <div className="p-3 border-t border-slate-100">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={5}
                    watchSlidesProgress
                    className="h-16"
                  >
                    {listing.imageUrls.map((url, i) => (
                      <SwiperSlide key={i}>
                        <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2",
                      activeTab === tab
                        ? "text-blue-600 border-blue-600 bg-blue-50/50"
                        : "text-slate-500 border-transparent hover:text-slate-700"
                    )}
                  >
                    {tab === "calculator" ? "Mortgage Calc" : tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{listing.name}</h2>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin size={14} className="text-blue-500 flex-shrink-0" />
                        {listing.address}
                      </div>
                    </div>

                    {/* Quick stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: <Bed size={18} />, label: "Bedrooms", value: listing.bedrooms },
                        { icon: <Bath size={18} />, label: "Bathrooms", value: listing.bathrooms },
                        ...(listing.squareFeet ? [{ icon: <Square size={18} />, label: "Sq Ft", value: formatNumber(listing.squareFeet) }] : []),
                        ...(listing.yearBuilt ? [{ icon: <Calendar size={18} />, label: "Year Built", value: listing.yearBuilt }] : []),
                      ].map((stat) => (
                        <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center">
                          <div className="flex justify-center text-blue-600 mb-1">{stat.icon}</div>
                          <div className="font-bold text-slate-900">{stat.value}</div>
                          <div className="text-xs text-slate-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-slate-600 leading-relaxed text-sm">{listing.description}</p>
                    </div>

                    {listing.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} size={16} className={cn(star <= Math.round(listing.avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-700">{listing.avgRating}</span>
                        <span className="text-slate-400 text-sm">({listing.numReviews} {listing.numReviews === 1 ? "review" : "reviews"})</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> Posted {timeAgo(listing.createdAt)}
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Property Features</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Parking", value: listing.parking, icon: <Car size={15} /> },
                          { label: "Furnished", value: listing.furnished, icon: <Sofa size={15} /> },
                          { label: "Pool", value: listing.pool, icon: <Waves size={15} /> },
                          { label: "Pet Friendly", value: listing.petFriendly, icon: <PawPrint size={15} /> },
                          { label: "Offer Available", value: listing.offer, icon: <TrendingDown size={15} /> },
                        ].map((f) => (
                          <div key={f.label} className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border text-sm",
                            f.value ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-50 border-slate-200 text-slate-400"
                          )}>
                            {f.value ? <Check size={15} className="text-green-500" /> : <X size={15} />}
                            {f.icon}
                            {f.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {listing.propertyType && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">Property Type</h3>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium capitalize">
                          <HomeIcon size={14} /> {listing.propertyType}
                        </span>
                      </div>
                    )}

                    {listing.amenities?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Additional Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {listing.amenities.map((a) => (
                            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">
                              <Check size={13} className="text-green-500" /> {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <ReviewSection listingId={listingId} />
                )}

                {activeTab === "calculator" && (
                  <MortgageCalculator price={displayPrice} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {formatPrice(displayPrice, listing.type)}
                  </div>
                  {listing.offer && listing.discountPrice > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-400 line-through text-sm">{formatPrice(listing.regularPrice, listing.type)}</span>
                      <span className="text-red-500 text-sm font-semibold">Save {formatPrice(listing.regularPrice - listing.discountPrice)}</span>
                    </div>
                  )}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white uppercase",
                  listing.type === "rent" ? "bg-emerald-500" : "bg-blue-600")}>
                  {listing.type === "rent" ? "Rent" : "Sale"}
                </span>
              </div>

              {currentUser && listing.userRef !== currentUser._id ? (
                !contact ? (
                  <button
                    onClick={() => setContact(true)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    <MessageSquare size={16} /> Contact Owner
                  </button>
                ) : (
                  <Contact listing={listing} />
                )
              ) : !currentUser ? (
                <Link
                  to="/sign-in"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Sign in to Contact
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 rounded-xl p-3">
                  <HomeIcon size={14} /> This is your listing
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={handleShare} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Share2 size={14} /> Share
                </button>
                <button onClick={handleToggleSave} className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm transition-colors",
                  saved ? "bg-red-50 border-red-200 text-red-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}>
                  <Heart size={14} className={saved ? "fill-red-500" : ""} />
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {/* Quick info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">Property Summary</h3>
              {[
                { label: "Property Type", value: listing.propertyType || "N/A" },
                { label: "Status", value: listing.status || "active" },
                { label: "Bedrooms", value: listing.bedrooms },
                { label: "Bathrooms", value: listing.bathrooms },
                ...(listing.squareFeet ? [{ label: "Area", value: `${formatNumber(listing.squareFeet)} sqft` }] : []),
                ...(listing.yearBuilt ? [{ label: "Year Built", value: listing.yearBuilt }] : []),
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-900 capitalize">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
