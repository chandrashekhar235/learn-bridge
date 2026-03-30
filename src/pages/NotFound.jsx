import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Big 404 */}
        <div className="relative mb-6">
          <h1
            className="text-[8rem] sm:text-[12rem] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: 0.9,
            }}
          >
            404
          </h1>

          {/* Floating emoji */}
          <span
            className="absolute top-4 right-0 text-5xl sm:text-6xl"
            style={{ animation: "floatBounce 3s ease-in-out infinite" }}
          >
            🚀
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Lost in Space
        </h2>

        <p className="text-base sm:text-lg mb-8 max-w-md" style={{ color: 'var(--text-secondary)' }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
          }}
        >
          ← Go Home
        </Link>
      </div>

      <Footer />

      <style>{`
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
