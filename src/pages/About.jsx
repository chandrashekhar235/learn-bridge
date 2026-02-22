import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4">
        
        <h1 className="text-4xl font-bold text-white text-center mb-6 mt-10">
          About Learn Bridge
        </h1>

        <p className="text-lg text-gray-400 text-center mb-12">
          Bridging the gap between learning and real-world skills
        </p>

        {/* Main Content */}
        <div className="shadow-md p-8 ">
          <h2 className="text-2xl font-semibold text-white ">
            What is Learn Bridge?
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Learn Bridge is a learning platform built with the goal of making
            education simple, practical, and effective. We focus on strong
            fundamentals, real-world application, and clarity of concepts so
            learners don’t just memorize — they understand.
          </p>
        </div>

        {/* Founders Section */}
        <div className="shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-6 ml-2">
            Meet the Builders
          </h2>

          <div className="flex flex-col md:flex-row justify-center gap-8">
            <div className="text-center">
                  <img
  src="sahil.jpeg"
  alt="Co-Founder"
  className="w-50 h-50 object-cover rounded-full mx-auto shadow-md"
/>
              <a
                href="https://www.linkedin.com/in/chandra-shekhar-a29789284/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-blue-400 hover:underline">
                 <div className="mt-2">Chandra Shekhar</div>

              </a>

              <p className="text-gray-400 mt-1">Full-Stack Web Developer</p>
            </div>
             <div className="text-center">
                  <img
  src="chetna.jpeg"
  alt="Co-Founder"
  className="w-50 h-50 object-cover rounded-full mx-auto shadow-md ml-30"
/>
              <a
                href="https://www.linkedin.com/in/singh-chetna-webdeveloper/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 text-blue-400 hover:underline ml-30">
                 <div className="mt-2">Chetna Singh</div>

              </a>

              <p className="text-gray-400 mt-1 ml-30">Full-Stack Web Developer</p>
            </div>
          </div>

          <p className="text-gray-400 mt-5">
            Built with passion for education and technology, Learn Bridge is a
            step towards meaningful and structured learning.
          </p>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About;
