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

      <div className="flex flex-col items-center flex-1 px-40 text-center mt-40">
        <h2 className="text-8xl text-[#f0f2f5]">
          Bridge <span className="text-blue-500"> To</span>{" "}
          <span> Learning </span>
        </h2>

        <p className="text-2xl text-slate-600 mt-5 max-w-2xl">
          Study together, stay consistent, and grow with the right people.
        </p>

        <div className="flex flex-col items-center mt-10 space-y-6">
    
          <div
            className="
              text-[#739ddb]
              text-2xl
              py-5
              rounded-2xl
              hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
              transition-shadow
              float-right-left
            "
          >
            <Button />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
