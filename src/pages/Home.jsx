import React from "react";
import Navbar from "../components/Navbar";
import Button from "../components/button";
import Footer from "../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-10 md:px-20 text-center">

        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#f0f2f5] leading-tight">
          Bridge <span className="text-blue-500">To</span> Learning
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-slate-400 mt-4 max-w-xl">
          Study together, stay consistent, and grow with the right people.
        </p>

        <div className="mt-8">
          <Button />
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Home;