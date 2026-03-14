import { Link } from "react-router-dom";
import { Shield, Users, TrendingUp, MapPin, Star, Home as HomeIcon, ArrowRight } from "lucide-react";

const TEAM = [
  { name: "Dev Patel", role: "Founder, Designer & Full-Stack Developer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevPatel&top=shortHairShortFlat&facialHair=beardMedium&facialHairColor=brown&hairColor=brown&clotheType=blazerShirt&backgroundColor=b6e3f4", bio: "Built IndiEstate from the ground up — from database design to UI/UX. Passionate about making real estate accessible for every Indian." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <HomeIcon size={14} /> About IndiEstate
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            India's Most Trusted<br />Real Estate Platform
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Since 2014, IndiEstate has been connecting buyers, sellers, and renters with their perfect properties across India's most vibrant cities.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "12,000+", label: "Properties Listed" },
            { value: "8,500+", label: "Happy Clients" },
            { value: "50+", label: "Cities" },
            { value: "10+", label: "Years" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-blue-600 mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              IndiEstate was founded with a simple but powerful mission: make real estate accessible, transparent, and stress-free for every Indian. Whether you're a first-time buyer or an experienced investor, we provide the tools and guidance you need.
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our platform combines cutting-edge technology with human expertise to deliver an unmatched property search experience. Every listing is verified, every agent is vetted, and every transaction is secured.
            </p>
            <Link to="/search" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Browse Listings <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Shield size={24} className="text-blue-600" />, title: "Verified", desc: "100% verified listings" },
              { icon: <Users size={24} className="text-emerald-500" />, title: "Trusted", desc: "8,500+ happy clients" },
              { icon: <TrendingUp size={24} className="text-purple-500" />, title: "Growing", desc: "50+ cities covered" },
              { icon: <Star size={24} className="text-amber-500" />, title: "Top Rated", desc: "4.8/5 average rating" },
            ].map((f) => (
              <div key={f.title} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Meet the Team</h2>
          <div className="flex justify-center">
            {TEAM.map((m) => (
              <div key={m.name} className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 rounded-2xl p-8 max-w-xl w-full">
                <img src={m.avatar} alt={m.name} className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex-shrink-0"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=3b82f6&textColor=ffffff`; }} />
                <div className="text-center sm:text-left">
                  <h3 className="font-bold text-slate-900 text-lg">{m.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-3">{m.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-14">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to find your perfect home?</h2>
          <p className="text-blue-100 mb-6">Join 8,500+ Indians who found their dream property on IndiEstate.</p>
          <Link to="/sign-up" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
