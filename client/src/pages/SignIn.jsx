import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
import { Mail, Lock, Eye, EyeOff, Home as HomeIcon } from "lucide-react";
import OAuth from "../components/OAuth.jsx";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) { dispatch(signInFailure(data.message)); return; }
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-800 flex-col items-center justify-center p-12 text-white">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <HomeIcon size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold"><span className="text-blue-200">Indi</span>Estate</span>
        </Link>
        <h2 className="text-3xl font-bold text-center mb-3">Find Your Dream Home</h2>
        <p className="text-blue-200 text-center leading-relaxed max-w-sm">
          Join thousands of Indians who trust IndiEstate to buy, sell, and rent properties seamlessly.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-xs">
          {["12,000+ Listings", "8,500+ Clients", "50+ Cities", "10+ Years"].map((s) => (
            <div key={s} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="font-bold text-lg">{s.split(" ")[0]}</p>
              <p className="text-blue-200 text-xs">{s.split(" ").slice(1).join(" ")}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HomeIcon size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold"><span className="text-blue-600">Indi</span>Estate</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm mb-7">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange}
                  placeholder="Enter your password" required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <OAuth />
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/sign-up" className="text-blue-600 font-semibold hover:text-blue-700">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
