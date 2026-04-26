import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InviteCard from "../components/InviteCard";
import { respondToInvite } from "../api/projects";
import { toast } from "react-toastify";
import API from "../api/axios";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const res = await API.get("/projects/invites");
        setInvites(res.data.invites || []);
      } catch (err) {
        // Only show a toast for real errors; empty invites list is handled silently
        const msg = err?.response?.data?.message || err?.message;
        if (msg && msg !== "No invites found") {
          toast.error(msg || "Failed to fetch invites");
        }
      }
    };
    fetchInvites();
  }, []);

  const handleResponse = async (inviteId, response) => {
    setLoadingId(inviteId);
    try {
      const res = await respondToInvite(inviteId, response);
      toast.success(res.data.message || `Invite ${response}ed`);
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
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
