import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  
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
    <nav className="w-full flex items-center justify-between py-2 px-10">
      
      {/* LOGO */}
      <div className="flex items-center space-x-10">
        <Link to="/">
          <img
            src="/logo.png"
            alt="LearnBridge Logo"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* CENTER LINKS */}
      <div className="flex items-center space-x-6 text-gray-300">
        <Link to="/" className="hover:text-white">
          Home
        </Link>
        <Link to="/explore" className="hover:text-white">
          Explore
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center space-x-4 text-gray-300">
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
            {/* Avatar + Name */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center space-x-2 hover:text-white"
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>

              <span className="text-red-400">
                {user?.name || "Profile"}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
