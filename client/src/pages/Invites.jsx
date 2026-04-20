import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InviteCard from "../components/InviteCard";
import { respondToInvite } from "../api/projects";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInvites = async () => {
      const res = await axios.get("http://localhost:3000/projects/invites", {
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      const { success, message, invites } = res.data;
      if (!success) {
        toast.error(message || "Failed to fetch invites");
        return;
      }
      setInvites(invites);
    };
    fetchInvites();
  }, []);

  // response = "accept" | "reject"
  const handleResponse = async (inviteId, response) => {
    setLoadingId(inviteId);
    try {
      const res = await respondToInvite(inviteId, response);
      const { success, message } = res.data;
      if (!success) {
        toast.error(message || "Failed to respond to invite");
        return;
      }
      toast.success(message || `Invite ${response}ed`);
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">Invites</h1>
          <p className="text-sm text-[#555] mt-0.5">
            {invites.length} pending invite{invites.length !== 1 ? "s" : ""}
          </p>
        </div>

        {invites.length === 0 ? (
          <div className="text-center py-20 text-[#444] text-sm">
            You're all caught up — no pending invites.
          </div>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <InviteCard
                key={invite.id}
                invite={invite}
                loading={loadingId === invite.id}
                onAccept={() => handleResponse(invite.id, "accept")}
                onReject={() => handleResponse(invite.id, "reject")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
