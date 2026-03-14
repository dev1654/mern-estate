import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact({ listing, landlord }) {
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();
  const [message, setMessage] = useState(`Hi, I'm interested in ${listing?.name}. Can we discuss further?`);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) { toast.error("Please write a message"); return; }
    setSending(true);
    try {
      // Get or create conversation
      const convRes = await fetch("/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          recipientId: listing.userRef,
          listingId: listing._id,
        }),
      });
      const conv = await convRes.json();
      if (conv.success === false) throw new Error(conv.message);

      // Send the message
      await fetch(`/api/conversation/${conv._id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: message }),
      });

      toast.success("Message sent! Opening chat...");
      navigate(`/inbox?conv=${conv._id}`);
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    }
    setSending(false);
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
      <p className="text-slate-600 text-sm">
        Send your first message to start a conversation with the owner.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        <Send size={14} /> {sending ? "Opening chat..." : "Send & Open Chat"}
      </button>
    </div>
  );
}
