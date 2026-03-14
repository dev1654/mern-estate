import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {
  Search, TrendingUp, Building2, Home as HomeIcon,
  ArrowRight, Star, Shield, Headphones, Award,
} from "lucide-react";
import ListingItem from "../components/ListingItem";

const STATS = [
  { label: "Properties Listed", value: "12,000+", icon: <Building2 size={22} /> },
  { label: "Happy Clients", value: "8,500+", icon: <Star size={22} /> },
  { label: "Cities Covered", value: "50+", icon: <HomeIcon size={22} /> },
  { label: "Years Experience", value: "10+", icon: <Award size={22} /> },
];

const FEATURES = [
  { icon: <Shield size={28} className="text-blue-600" />, title: "Verified Listings", desc: "All properties are verified and authenticated before listing." },
  { icon: <Search size={28} className="text-emerald-500" />, title: "Smart Search", desc: "Filter by price, type, amenities, and more in seconds." },
  { icon: <Headphones size={28} className="text-purple-500" />, title: "24/7 Support", desc: "Our expert agents are always here to guide you." },
  { icon: <TrendingUp size={28} className="text-amber-500" />, title: "Best Deals", desc: "Get exclusive offers and price drops in your area." },
];

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [heroListings, setHeroListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [offers, rent, sale] = await Promise.all([
          fetch("/api/listing/get?offer=true&limit=4").then((r) => r.json()),
          fetch("/api/listing/get?type=rent&limit=4").then((r) => r.json()),
          fetch("/api/listing/get?type=sale&limit=4").then((r) => r.json()),
        ]);
        setOfferListings(Array.isArray(offers) ? offers : []);
        setRentListings(Array.isArray(rent) ? rent : []);
        setSaleListings(Array.isArray(sale) ? sale : []);
        const combined = [...(Array.isArray(offers) ? offers : []), ...(Array.isArray(sale) ? sale : [])];
        setHeroListings(combined.slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${searchTerm}`);
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative h-[580px] md:h-[640px] overflow-hidden">
        {heroListings.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay, Pagination, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="h-full"
          >
            {heroListings.map((listing) => (
              <SwiperSlide key={listing._id}>
                <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url(${listing.imageUrls?.[0]})` }}>
                  <div className="h-full bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
          <div className="text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <TrendingUp size={14} /> India's #1 Real Estate Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              Find Your Perfect
              <span className="block text-blue-300">Dream Home</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto">
              Discover thousands of verified properties across India — buy, rent, or sell with confidence.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="City, address, or landmark..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-lg"
                />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg flex items-center gap-2">
                <Search size={16} /> Search
              </button>
            </form>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                { label: "For Rent", href: "/search?type=rent" },
                { label: "For Sale", href: "/search?type=sale" },
                { label: "With Offers", href: "/search?offer=true" },
                { label: "Villas", href: "/search?propertyType=villa" },
                { label: "Apartments", href: "/search?propertyType=apartment" },
              ].map((t) => (
                <button key={t.label} onClick={() => navigate(t.href)}
                  className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-blue-600 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center text-white">
              <div className="flex justify-center mb-2 opacity-80">{s.icon}</div>
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-blue-100 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LISTINGS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {offerListings.length > 0 && (
          <Section title="Hot Deals & Offers" subtitle="Limited-time discounts on premium properties" link="/search?offer=true" listings={offerListings} />
        )}
        {rentListings.length > 0 && (
          <Section title="Available for Rent" subtitle="Find comfortable homes for monthly living" link="/search?type=rent" listings={rentListings} />
        )}
        {saleListings.length > 0 && (
          <Section title="Properties for Sale" subtitle="Invest in your future — browse top sale listings" link="/search?type=sale" listings={saleListings} />
        )}
      </div>

      {/* FEATURES */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose IndiEstate?</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">India's most trusted property platform with unmatched features.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4 p-3 bg-slate-50 rounded-xl w-fit mx-auto">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Ready to List Your Property?</h2>
          <p className="text-blue-100 mb-7 text-lg">Reach thousands of verified buyers and renters across India.</p>
          <Link to="/create-listing" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Post a Listing <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <HomeIcon size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg"><span className="text-blue-400">Indi</span>Estate</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} IndiEstate. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/search" className="hover:text-white transition-colors">Listings</Link>
            <Link to="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, subtitle, link, listings }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <Link to={link} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors">
          View all <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {listings.map((listing) => (
          <ListingItem key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
