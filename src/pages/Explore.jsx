import React from "react";
import Navbar from "../components/Navbar";
import Vc from "./Vc";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../animations.css";

const Explore = () => {
  return (
    <div>
     <div  className="min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1 : Blogs */}
          <Link to="/blogs">
            <div className="relative h-[420px] rounded-3xl overflow-hidden group cursor-pointer">

             <img src="/blogs.jpg"  
                alt="Blogs"
                className="absolute inset-0 w-full h-full object-cover opacity-25 transition duration-500 group-hover:opacity-15"
              />

              <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/40 pointer-events-none" />

              <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                <h2 className="text-xl font-semibold">
                  Blogs / Post Work
                </h2>

                <p className="text-sm opacity-0 translate-y-6 transition duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  Write blogs, share posts, and showcase your ideas and work.
                </p>
              </div>

            </div>
          </Link>

          {/* Card 2 : Chats */}
          <Link to="/vc">
         <div className="relative h-[420px] rounded-3xl overflow-hidden group cursor-pointer">

  {/* Background Image */}
  <img src="/chat.jpg"
    alt="Chats"
    className="absolute inset-0 w-full h-full object-cover opacity-25 transition duration-500 group-hover:opacity-15"
  />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/40 pointer-events-none" />

  {/* Content */}
  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
    <h2 className="text-xl font-semibold">
      VC / Chats / Groups
    </h2>

    <p className="text-sm opacity-0 translate-y-6 transition duration-500 group-hover:opacity-100 group-hover:translate-y-0">
      Start voice chats, join groups, collaborate with friends
      and communicate in real time.
    </p>
  </div>

</div>
</Link>

          {/* Card 3 : Connect */}
          <Link to="/connect">
        <div className="relative h-[420px] rounded-3xl overflow-hidden group cursor-pointer">

  {/* Background Image */}
  <img src="/connect.jpg"
    alt="Connect"
    className="absolute inset-0 w-full h-full object-cover opacity-25 transition duration-500 group-hover:opacity-15"
  />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/40 pointer-events-none" />

  {/* Content */}
  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
    <h2 className="text-xl font-semibold">
      Connect With People
    </h2>

    <p className="text-sm opacity-0 translate-y-6 transition duration-500 group-hover:opacity-100 group-hover:translate-y-0">
      Discover new people, build connections, collaborate,
      and grow your network in a friendly community.
    </p>
  </div>

</div>
</Link>

        </div>
      </div>
</div>
      <Footer />
      </div>
  );
};


export default Explore;
