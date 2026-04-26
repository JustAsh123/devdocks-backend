import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const navLink = (to, label) => {
    const active = pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`relative text-sm transition-colors duration-200 group ${
          active ? "text-white" : "text-[#666] hover:text-[#bbb]"
        }`}
      >
        {label}
        <span
          className={`absolute -bottom-1 left-0 h-px bg-white transition-all duration-300 ${
            active ? "w-full" : "w-0 group-hover:w-full"
          }`}
        />
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between animate-slideDown">
      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2 group">
        <span className="w-2 h-2 rounded-full bg-white group-hover:scale-125 transition-transform duration-200" />
        <span className="text-white font-semibold text-sm tracking-tight">
          DevDocks
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-5">
        {navLink("/dashboard", "Dashboard")}
        {navLink("/invites", "Invites")}

        {user ? (
          <div className="flex items-center gap-3 ml-1 pl-4 border-l border-[#222]">
            <span className="text-xs text-[#444]">
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-[#555] hover:text-red-400 transition-colors duration-200 btn-hover"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-xs text-[#555] hover:text-white transition-colors duration-200 ml-1 btn-hover"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
