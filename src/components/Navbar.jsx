import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import BASE_URL from "../config";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <nav className="w-full px-6 py-3 flex items-center justify-between relative text-gray-300">

  {/* LEFT: LOGO */}
  <div className="flex-1">
    <Link to="/">
      <img
        src="/logo.png"
        alt="LearnBridge Logo"
        className="h-12 w-auto"
      />
    </Link>
  </div>

  {/* CENTER: LINKS */}
  <div className="hidden md:flex flex-1 justify-center space-x-8">
    <Link to="/" className="hover:text-white">
      Home
    </Link>
    <Link to="/explore" className="hover:text-white">
      Explore
    </Link>
  </div>

  {/* RIGHT SIDE */}
  <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
    {!isLoggedIn ? (
      <>
        <button
          onClick={() =>
            navigate("/signup", { state: { background: location } })
          }
          className="hover:text-white"
        >
          Signup
        </button>

        <button
          onClick={() =>
            navigate("/login", { state: { background: location } })
          }
          className="hover:text-white"
        >
          Login
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center space-x-2 hover:text-white"
        >
          <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center text-xs text-white">
            {user?.avatar ? (
              <img
                src={`${BASE_URL}${user.avatar}`}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>

          <span className="text-red-400">
            {user?.name || "Profile"}
          </span>
        </button>

        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-500"
        >
          Logout
        </button>
      </>
    )}
  </div>

  {/* MOBILE MENU BUTTON */}
  <div className="md:hidden">
    <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
  </div>

</nav>
  );
};

export default Navbar;  