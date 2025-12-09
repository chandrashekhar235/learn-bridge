import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Import the CSS file

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full bg-[#f0f2f5] flex items-center justify-between py-2 px-10 shadow-none border-0">
        
        <div className="flex items-center space-x-10">
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="LearnBridge Logo" 
              className="h-12 w-auto"
            />
          </Link>

          <Link to="/" className="text-gray-700 hover:text-black">Home</Link>
          <Link to="/explore" className="text-gray-700 hover:text-black">Explore</Link>
          <Link to="/about" className="text-gray-700 hover:text-black">About</Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/signup" className="text-gray-700 hover:text-black">SignUp</Link>
          <Link to="/login" className="text-gray-700 hover:text-black">Login</Link>
        </div>

      </nav>

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center flex-1 px-6 text-center mt-16">

        <h2 className="text-4xl sm:text-5xl font-bold text-[#1a1f36]">
          Bridge <span className="text-blue-500">To Learning</span>
        </h2>

        <p className="text-lg sm:text-2xl text-slate-600 mt-5 max-w-2xl">
          Study together, stay consistent, and grow with the right people.
        </p>

        

        {/* FLOATING CARDS */}
        <div className="flex flex-col items-center w-full  gap-10">
          <div
          className="
          bg-[#f0f2f5]
             w-[55%]
             py-5
             mt-4
              rounded-2xl
              hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
              transition-shadow
              float-right-left
          "
        >
          focus on what matters most
        </div>

          <Link
            to="/study"
            className="
             bg-[#f0f2f5]
             w-[55%]
             py-5
              rounded-2xl
              hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
              transition-shadow
              float-right-left
            "
          >
            Study with peers (Stay Consistent)  
          </Link>

         
          <Link
            to="/explore"
            className="
             bg-[#f0f2f5]
             w-[55%]
             py-5
          rounded-2xl
              hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
              transition-shadow
              float-right-left
            "
          >
            Explore Study Resources
          </Link>

          {/* CHAT BOX (FLOAT RIGHT → LEFT) */}
          <Link
            to="/chat"
            className="
             bg-[#f0f2f5]
             w-[55%]
            
              rounded-2xl
              hover:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
              transition-shadow
              float-right-left
            "
          >
             Make Friends
          </Link>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#f0f2f5] py-8 text-center text-gray-600 text-sm mt-20">
        <div className="flex justify-center gap-10 mb-3 text-lg">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/explore" className="hover:text-blue-600">Explore</Link>
          <Link to="/about" className="hover:text-blue-600">About</Link>
        </div>
        <p>© 2025 LearnBridge. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Home;