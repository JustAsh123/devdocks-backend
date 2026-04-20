import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signupUser(form);
      const { success, message, data, token } = res.data;
      if (!success) {
        toast.error(message || "Signup failed");
        return;
      }
      login({ token, user: data });
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            to="/home"
            className="text-sm text-[#555] hover:text-white transition-colors"
          >
            ← DevDocks
          </Link>
          <h1 className="text-2xl font-semibold text-white mt-5 mb-1">
            Create an account
          </h1>
          <p className="text-sm text-[#555]">Get started for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#888] mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-sm font-medium py-2.5 rounded-lg hover:bg-[#e0e0e0] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs text-[#555] mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#aaa] hover:text-white transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
