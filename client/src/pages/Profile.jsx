import { useSelector, useDispatch } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart, deleteUserFailure, deleteUserSuccess,
  signOutUserStart, signOutUserSuccess, signOutUserFailure,
} from "../redux/user/userSlice.js";
import { Link, useNavigate } from "react-router-dom";
import { Camera, User, Mail, Lock, Phone, FileText, LogOut, Trash2, PlusSquare, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((s) => s.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    phone: currentUser.phone || "",
    bio: currentUser.bio || "",
    password: "",
    avatar: currentUser.avatar || dicebearUrl,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  // Auto-save DiceBear avatar to DB if user has none
  useEffect(() => {
    if (!currentUser.avatar) {
      fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatar: dicebearUrl }),
      })
        .then(r => r.json())
        .then(data => { if (data._id) dispatch(updateUserSuccess(data)); })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => setFilePerc(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      () => setFileUploadError(true),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFormData((f) => ({ ...f, avatar: url }));
          setFileUploadError(false);
          toast.success("Photo uploaded!");
        });
      }
    );
  };

  const handleChange = (e) => setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const body = { ...formData };
      if (!body.password) delete body.password;
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success === false) { dispatch(updateUserFailure(data.message)); return; }
      dispatch(updateUserSuccess(data));
      toast.success("Profile updated!");
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      toast.error("Update failed");
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success === false) { dispatch(deleteUserFailure(data.message)); return; }
      dispatch(deleteUserSuccess(data));
      navigate("/sign-in");
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch("/api/auth/signout");
      dispatch(signOutUserSuccess());
      navigate("/sign-in");
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <User size={22} className="text-blue-600" /> My Profile
        </h1>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={formData.avatar || dicebearUrl}
                alt="profile"
                onError={(e) => { e.target.src = dicebearUrl; }}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <input onChange={(e) => setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*" />
            <p className="text-sm mt-3 text-slate-500">
              {fileUploadError ? (
                <span className="text-red-500">Upload error — image must be under 2MB</span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <span className="text-blue-600">Uploading {filePerc}%...</span>
              ) : filePerc === 100 ? (
                <span className="text-emerald-600">Uploaded!</span>
              ) : (
                <span>Click the camera icon to change photo</span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="username" type="text" value={formData.username} onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input id="email" type="email" value={formData.email} onChange={handleChange}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 9999 999999"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-3 text-slate-400" />
                <textarea id="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell others about yourself..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="New password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link to="/create-listing"
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
            <PlusSquare size={16} className="text-blue-600" /> Add Listing
          </Link>
          <button onClick={handleSignOut}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
            <LogOut size={16} className="text-slate-500" /> Sign Out
          </button>
          <button onClick={handleDeleteUser}
            className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition-colors text-sm shadow-sm">
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
