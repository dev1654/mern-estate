import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search, Home, Info, Menu, X, ChevronDown,
  Heart, LayoutDashboard, PlusSquare, LogOut, User, MessageSquare,
} from "lucide-react";
import { signOutUserSuccess } from "../redux/user/userSlice";
import { cn } from "../lib/utils";

export default function Header() {
  const { currentUser } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("searchTerm") || "");
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = () => {
      fetch("/api/conversation/unread", { credentials: "include" })
        .then(r => r.json())
        .then(data => setUnreadCount(data?.count || 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?searchTerm=${searchTerm}`);
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout");
    dispatch(signOutUserSuccess());
    navigate("/sign-in");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Listings" },
    { to: "/about", label: "About" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 bg-white",
        scrolled ? "shadow-md border-b border-slate-200" : "border-b border-slate-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-blue-600">Indi</span>
              <span className="text-slate-900">Estate</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search city, address..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {link.label}
              </Link>
            ))}

            {currentUser ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}&backgroundColor=b6e3f4`}
                    alt="avatar"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}&backgroundColor=b6e3f4`; }}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
                    {currentUser.username}
                  </span>
                  <ChevronDown size={14} className={cn("text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-200 py-1.5">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.email}</p>
                    </div>
                    <MenuItem to="/profile" icon={<User size={15} />} label="Profile" />
                    <MenuItem to="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" />
                    <div className="relative">
                      <MenuItem to="/inbox" icon={<MessageSquare size={15} />} label="Inbox" />
                      {unreadCount > 0 && <span className="absolute right-3 top-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
                    </div>
                    <MenuItem to="/favorites" icon={<Heart size={15} />} label="Saved Listings" />
                    <MenuItem to="/create-listing" icon={<PlusSquare size={15} />} label="Add Listing" />
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
            {currentUser ? (
              <>
                <div className="border-t border-slate-100 my-2" />
                <Link to="/profile" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"><User size={16} /> Profile</Link>
                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"><LayoutDashboard size={16} /> Dashboard</Link>
                <div className="relative">
                  <Link to="/inbox" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"><MessageSquare size={16} /> Inbox</Link>
                  {unreadCount > 0 && <span className="absolute right-3 top-2.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
                </div>
                <Link to="/favorites" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"><Heart size={16} /> Saved Listings</Link>
                <Link to="/create-listing" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"><PlusSquare size={16} /> Add Listing</Link>
                <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"><LogOut size={16} /> Sign Out</button>
              </>
            ) : (
              <Link to="/sign-in" className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors mt-2">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
      <span className="text-slate-400">{icon}</span>
      {label}
    </Link>
  );
}
