import { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Upload, X, Image as ImageIcon, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { PROPERTY_TYPES, cn } from "../lib/utils";

const INITIAL_FORM = {
  imageUrls: [],
  name: "",
  description: "",
  address: "",
  type: "rent",
  propertyType: "house",
  bedrooms: 1,
  bathrooms: 1,
  squareFeet: "",
  yearBuilt: "",
  regularPrice: 5000,
  discountPrice: 0,
  offer: false,
  parking: false,
  furnished: false,
  pool: false,
  petFriendly: false,
};

export default function CreateListing() {
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();

  const handleImageSubmit = () => {
    if (files.length === 0) { toast.error("Select images first"); return; }
    if (files.length + formData.imageUrls.length > 6) {
      setImageUploadError("Max 6 images per listing"); return;
    }
    setUploading(true);
    setImageUploadError(false);
    Promise.all(Array.from(files).map(storeImage))
      .then((urls) => {
        setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, ...urls] }));
        setUploading(false);
        toast.success("Images uploaded!");
      })
      .catch(() => {
        setImageUploadError("Upload failed. Max 2MB per image.");
        setUploading(false);
      });
  };

  const storeImage = (file) =>
    new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const storageRef = ref(storage, new Date().getTime() + file.name);
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed", null, reject, () =>
        getDownloadURL(task.snapshot.ref).then(resolve)
      );
    });

  const handleRemoveImage = (i) =>
    setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, idx) => idx !== i) }));

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    if (id === "sale" || id === "rent") {
      setFormData((f) => ({ ...f, type: id }));
    } else if (type === "checkbox") {
      setFormData((f) => ({ ...f, [id]: checked }));
    } else {
      setFormData((f) => ({ ...f, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length < 1) { setError("Upload at least one image"); return; }
    if (+formData.regularPrice < +formData.discountPrice) { setError("Discount price must be less than regular price"); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) { setError(data.message); return; }
      toast.success("Listing created!");
      navigate(`/listing/${data._id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const Checkbox = ({ id, label }) => (
    <label className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer select-none text-sm transition-colors",
      formData[id] ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
    )}>
      <input type="checkbox" id={id} checked={!!formData[id]} onChange={handleChange} className="sr-only" />
      <span className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
        formData[id] ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white")}>
        {formData[id] && <svg viewBox="0 0 10 8" className="w-2.5 h-2 text-white fill-white"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
      </span>
      {label}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle size={22} className="text-blue-600" /> Create New Listing
          </h1>
          <p className="text-slate-500 text-sm mt-1">Fill in the details to list your property</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Name</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Modern 3BHK in Bandra" maxLength="62" minLength="5" required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea id="description" value={formData.description} onChange={handleChange}
                  placeholder="Describe the property, location, nearby facilities..." rows={4} required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Address</label>
                <input type="text" id="address" value={formData.address} onChange={handleChange}
                  placeholder="Street, City, State, PIN" required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Type</label>
                <select id="propertyType" value={formData.propertyType} onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white">
                  {PROPERTY_TYPES.filter(pt => pt.value !== "all").map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Listing Type & Amenities</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Listing For</label>
                <div className="flex gap-3">
                  {["rent", "sale"].map((t) => (
                    <button key={t} type="button" onClick={() => setFormData(f => ({ ...f, type: t }))}
                      className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors",
                        formData.type === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}>
                      {t === "rent" ? "For Rent" : "For Sale"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Checkbox id="parking" label="Parking" />
                <Checkbox id="furnished" label="Furnished" />
                <Checkbox id="offer" label="Special Offer" />
                <Checkbox id="pool" label="Pool" />
                <Checkbox id="petFriendly" label="Pet Friendly" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Details & Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bedrooms</label>
                  <input type="number" id="bedrooms" min="1" max="20" value={formData.bedrooms} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bathrooms</label>
                  <input type="number" id="bathrooms" min="1" max="20" value={formData.bathrooms} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Area (sq ft)</label>
                  <input type="number" id="squareFeet" min="0" value={formData.squareFeet} onChange={handleChange} placeholder="e.g. 1200"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year Built</label>
                  <input type="number" id="yearBuilt" min="1900" max={new Date().getFullYear()} value={formData.yearBuilt} onChange={handleChange} placeholder="e.g. 2018"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Regular Price {formData.type === "rent" && <span className="text-slate-400 font-normal">/ month</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span>
                  <input type="number" id="regularPrice" min="0" value={formData.regularPrice} onChange={handleChange} required
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
              </div>
              {formData.offer && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Discounted Price {formData.type === "rent" && <span className="text-slate-400 font-normal">/ month</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">₹</span>
                    <input type="number" id="discountPrice" min="0" value={formData.discountPrice} onChange={handleChange}
                      className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column — images */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-900">Property Photos</h2>
              <p className="text-sm text-slate-500">Upload up to 6 images. First image will be the cover photo.</p>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <ImageIcon size={32} className="mx-auto text-slate-300 mb-3" />
                <input type="file" id="images" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)}
                  className="hidden" />
                <label htmlFor="images" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Click to select images
                </label>
                <p className="text-slate-400 text-xs mt-1">JPG, PNG up to 2MB each</p>
              </div>

              <button type="button" onClick={handleImageSubmit} disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                <Upload size={16} /> {uploading ? "Uploading..." : "Upload Images"}
              </button>

              {imageUploadError && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">{imageUploadError}</p>
              )}

              {formData.imageUrls.length > 0 && (
                <div className="space-y-2">
                  {formData.imageUrls.map((url, i) => (
                    <div key={url} className="flex items-center gap-3 bg-slate-50 rounded-xl p-2">
                      <img src={url} alt={`image ${i + 1}`} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 truncate">Image {i + 1}</p>
                        {i === 0 && <p className="text-xs text-blue-600">Cover photo</p>}
                      </div>
                      <button type="button" onClick={() => handleRemoveImage(i)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button type="submit" disabled={loading || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm disabled:opacity-60 text-base">
              {loading ? "Creating Listing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
