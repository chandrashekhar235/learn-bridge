import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Always fetch user profile from DB when logged in
  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
    window.location.reload();
  };

  // Close menu on outside tap
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
   <nav className="w-full px-4 sm:px-8 py-3 flex items-center justify-between relative text-gray-300">
      {/* LEFT: LOGO */}
      <div className="flex-1">
        <Link to="/">
          <img
            src="/logo.png"
            alt="LearnBridge Logo"
            className="h-10 sm:h-12 w-auto"
          />
        </Link>
      </div>

      {/* CENTER LINKS (Desktop Only) */}
      <div className="hidden md:flex flex-1 justify-center space-x-8">
        <Link to="/" className="hover:text-white">
          Home
        </Link>
        <Link to="/explore" className="hover:text-white">
          Explore
        </Link>
      </div>

      {/* RIGHT SIDE (Desktop Only) */}
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
              {user?.avatar ? (
                <img
                  src={`${BASE_URL}${user.avatar}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="text-gray-200">
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

      {/* MOBILE HAMBURGER */}
      <div className="md:hidden" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white text-2xl w-10 h-10 flex items-center justify-center"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* MOBILE DROPDOWN */}
        {menuOpen && (
          <div className="absolute top-16 right-4 w-52 bg-gray-900/95 backdrop-blur-sm p-5 rounded-xl shadow-lg flex flex-col space-y-4 z-50 border border-white/10">

            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-white">
              Home
            </Link>

            <Link to="/explore" onClick={() => setMenuOpen(false)} className="hover:text-white">
              Explore
            </Link>

            <hr className="border-white/10" />

            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/signup", { state: { background: location } });
                  }}
                  className="text-left hover:text-white"
                >
                  Signup
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/login", { state: { background: location } });
                  }}
                  className="text-left hover:text-white"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center space-x-2 hover:text-white"
                >
                  {user?.avatar ? (
                    <img
                      src={`${BASE_URL}${user.avatar}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <span>{user?.name || "Profile"}</span>
                </button>

                <button
                  onClick={logout}
                  className="text-left text-red-400 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;