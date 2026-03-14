import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";
import ListingItem from "../components/ListingItem";
import { PROPERTY_TYPES, cn } from "../lib/utils";

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "regularPrice_asc", label: "Price: Low to High" },
  { value: "regularPrice_desc", label: "Price: High to Low" },
  { value: "views_desc", label: "Most Viewed" },
];

const DEFAULT_FILTERS = {
  searchTerm: "",
  type: "all",
  propertyType: "all",
  parking: false,
  furnished: false,
  offer: false,
  pool: false,
  petFriendly: false,
  sort: "createdAt",
  order: "desc",
  minPrice: "",
  maxPrice: "",
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const sortVal = p.get("sort") || "createdAt";
    const orderVal = p.get("order") || "desc";
    setFilters({
      searchTerm: p.get("searchTerm") || "",
      type: p.get("type") || "all",
      propertyType: p.get("propertyType") || "all",
      parking: p.get("parking") === "true",
      furnished: p.get("furnished") === "true",
      offer: p.get("offer") === "true",
      pool: p.get("pool") === "true",
      petFriendly: p.get("petFriendly") === "true",
      sort: sortVal,
      order: orderVal,
      minPrice: p.get("minPrice") || "",
      maxPrice: p.get("maxPrice") || "",
    });

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const res = await fetch(`/api/listing/get?${p.toString()}&limit=9`);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
      setShowMore(Array.isArray(data) && data.length === 9);
      setLoading(false);
    };
    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked, type } = e.target;
    if (["all", "rent", "sale"].includes(id)) {
      setFilters((f) => ({ ...f, type: id }));
    } else if (type === "checkbox") {
      setFilters((f) => ({ ...f, [id]: checked }));
    } else if (id === "sort_order") {
      const [sort, order] = value.split("_");
      setFilters((f) => ({ ...f, sort, order }));
    } else {
      setFilters((f) => ({ ...f, [id]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v !== false) p.set(k, v);
    });
    navigate(`/search?${p.toString()}`);
  };

  const onShowMore = async () => {
    const p = new URLSearchParams(location.search);
    p.set("startIndex", listings.length);
    p.set("limit", 9);
    const res = await fetch(`/api/listing/get?${p.toString()}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length < 9) setShowMore(false);
    setListings((prev) => [...prev, ...(Array.isArray(data) ? data : [])]);
  };

  const activeFilterCount = [
    filters.type !== "all",
    filters.propertyType !== "all",
    filters.parking,
    filters.furnished,
    filters.offer,
    filters.pool,
    filters.petFriendly,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top search bar */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="searchTerm"
                type="text"
                value={filters.searchTerm}
                onChange={handleChange}
                placeholder="Search city, address, property name..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                showFilters
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Search
            </button>
          </form>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Listing Type</label>
                  <div className="flex gap-2">
                    {["all", "rent", "sale"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilters((f) => ({ ...f, type: t }))}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors",
                          filters.type === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {t === "all" ? "All" : t === "rent" ? "Rent" : "Sale"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Property Type</label>
                  <select
                    id="propertyType"
                    value={filters.propertyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      id="minPrice"
                      type="number"
                      value={filters.minPrice}
                      onChange={handleChange}
                      placeholder="Min ₹"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      id="maxPrice"
                      type="number"
                      value={filters.maxPrice}
                      onChange={handleChange}
                      placeholder="Max ₹"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sort By</label>
                  <select
                    id="sort_order"
                    value={`${filters.sort}_${filters.order}`}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amenity checkboxes */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Amenities</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: "parking", label: "Parking" },
                    { id: "furnished", label: "Furnished" },
                    { id: "offer", label: "With Offer" },
                    { id: "pool", label: "Pool" },
                    { id: "petFriendly", label: "Pet Friendly" },
                  ].map((a) => (
                    <label key={a.id} className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors select-none",
                      filters[a.id] ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}>
                      <input type="checkbox" id={a.id} checked={filters[a.id]} onChange={handleChange} className="sr-only" />
                      {a.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {loading ? "Searching..." : `${listings.length} ${listings.length === 1 ? "property" : "properties"} found`}
            </h1>
            {filters.searchTerm && (
              <p className="text-slate-500 text-sm mt-0.5">Results for "{filters.searchTerm}"</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
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
            <SearchIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">No properties found</h2>
            <p className="text-slate-400 mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingItem key={listing._id} listing={listing} />
              ))}
            </div>
            {showMore && (
              <div className="text-center mt-8">
                <button
                  onClick={onShowMore}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm"
                >
                  Load More Properties
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
