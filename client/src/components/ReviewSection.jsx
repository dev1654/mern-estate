import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Star, Trash2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { timeAgo, cn } from "../lib/utils";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={cn(
              "transition-colors",
              star <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-100"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ listingId }) {
  const { currentUser } = useSelector((s) => s.user);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/review/${listingId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [listingId]);

  const alreadyReviewed = currentUser && reviews.some((r) => r.user?._id === currentUser._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { toast.error("Please select a rating"); return; }
    if (!comment.trim()) { toast.error("Please write a comment"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/review/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId, rating, comment }),
      });
      const data = await res.json();
      if (data.success === false) throw new Error(data.message);
      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/review/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      toast.success("Review deleted");
      fetchReviews();
    } catch { toast.error("Failed to delete review"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600" />
          Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Star size={15} className="text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-700">
              {(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Write review */}
      {currentUser && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-2xl p-5 space-y-4">
          <h4 className="font-medium text-slate-800 text-sm">Write a Review</h4>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this property..."
            rows={3}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {alreadyReviewed && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 text-center">
          You've already reviewed this property.
        </p>
      )}

      {!currentUser && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 text-center">
          <a href="/sign-in" className="text-blue-600 hover:underline font-medium">Sign in</a> to write a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-2xl p-4 h-20" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={review.user?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                    alt={review.user?.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{review.user?.username}</p>
                    <p className="text-xs text-slate-400">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={13} className={cn(s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} />
                    ))}
                  </div>
                  {currentUser?._id === review.user?._id && (
                    <button onClick={() => handleDelete(review._id)} className="text-red-400 hover:text-red-600 transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
