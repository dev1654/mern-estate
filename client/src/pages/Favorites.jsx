import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import ListingItem from "../components/ListingItem";

export default function Favorites() {
  const { currentUser } = useSelector((s) => s.user);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch(`/api/user/saved/${currentUser._id}`, { credentials: "include" });
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchSaved();
  }, [currentUser._id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" /> Saved Properties
            </h1>
            <p className="text-slate-500 text-sm mt-1">{listings.length} saved listings</p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Search size={16} /> Browse More
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                <div className="bg-slate-200 h-48 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">No saved properties</h2>
            <p className="text-slate-400 mt-1 mb-6">Browse listings and tap the heart to save them here</p>
            <Link to="/search" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
