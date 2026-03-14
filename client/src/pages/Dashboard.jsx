import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Building2, Eye, Heart, PlusSquare,
  TrendingUp, Edit3, Trash2, ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice, timeAgo } from "../lib/utils";

export default function Dashboard() {
  const { currentUser } = useSelector((s) => s.user);
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/user/stats/${currentUser._id}`, { credentials: "include" });
        const data = await res.json();
        setStats(data);
      } catch { /* ignore */ }
      setLoadingStats(false);
    };

    const fetchListings = async () => {
      try {
        const res = await fetch(`/api/user/listings/${currentUser._id}`, { credentials: "include" });
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
      setLoadingListings(false);
    };

    fetchStats();
    fetchListings();
  }, [currentUser._id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      const res = await fetch(`/api/listing/delete/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setListings((prev) => prev.filter((l) => l._id !== id));
      toast.success("Listing deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const StatCard = ({ label, value, icon, color }) => (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{loadingStats ? "..." : value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard size={24} className="text-blue-600" /> Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Welcome back, {currentUser.username}!</p>
          </div>
          <Link
            to="/create-listing"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <PlusSquare size={16} /> New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Listings" value={stats?.totalListings ?? 0} icon={<Building2 size={20} className="text-blue-600" />} color="bg-blue-50" />
          <StatCard label="Active Listings" value={stats?.activeListings ?? 0} icon={<TrendingUp size={20} className="text-emerald-600" />} color="bg-emerald-50" />
          <StatCard label="Total Views" value={stats?.totalViews ?? 0} icon={<Eye size={20} className="text-purple-600" />} color="bg-purple-50" />
          <StatCard label="Saved Properties" value={stats?.savedListings ?? 0} icon={<Heart size={20} className="text-red-500" />} color="bg-red-50" />
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">My Listings</h2>
            <Link to="/search" className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loadingListings ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 animate-pulse">
                  <div className="w-20 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
              <h3 className="font-semibold text-slate-700">No listings yet</h3>
              <p className="text-slate-400 text-sm mt-1 mb-4">Create your first listing to get started</p>
              <Link to="/create-listing" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {listings.map((listing) => (
                <div key={listing._id} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <img
                    src={listing.imageUrls?.[0]}
                    alt={listing.name}
                    className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/listing/${listing._id}`}>
                      <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate text-sm">
                        {listing.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{listing.address}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(listing.offer && listing.discountPrice > 0 ? listing.discountPrice : listing.regularPrice, listing.type)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye size={11} /> {listing.views || 0}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(listing.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/update-listing/${listing._id}`}
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(listing._id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
