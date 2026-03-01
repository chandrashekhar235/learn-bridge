import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4 mt-10">
          About Learn Bridge
        </h1>

        <p className="text-base sm:text-lg text-gray-400 text-center mb-10">
          Bridging the gap between learning and real-world skills
        </p>

        {/* Main Content */}
        <div className="shadow-md bg-gray-900 rounded-2xl p-6 sm:p-8 mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
            What is Learn Bridge?
          </h2>
          <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
            Learn Bridge is a learning platform built with the goal of making
            education simple, practical, and effective. We focus on strong
            fundamentals, real-world application, and clarity of concepts so
            learners don’t just memorize — they understand.
          </p>
        </div>

        {/* Founders Section */}
        <div className="shadow-md bg-gray-900 rounded-2xl p-6 sm:p-8 text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-8">
            Meet the Builders
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">

            {/* Founder 1 */}
            <div className="text-center">
              <img
                src="sahil.jpeg"
                alt="Chandra Shekhar"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full mx-auto shadow-lg"
              />

              <a
                href="https://www.linkedin.com/in/chandra-shekhar-a29789284/"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-blue-400 hover:underline text-lg"
              >
                Chandra Shekhar
              </a>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Full-Stack Web Developer
              </p>
            </div>

            {/* Founder 2 */}
            <div className="text-center">
              <img
                src="chetna.jpeg"
                alt="Chetna Singh"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full mx-auto shadow-lg"
              />

              <a
                href="https://www.linkedin.com/in/singh-chetna-webdeveloper/"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-blue-400 hover:underline text-lg"
              >
                Chetna Singh
              </a>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Full-Stack Web Developer
              </p>
            </div>

          </div>

          <p className="text-gray-400 mt-8 text-sm sm:text-base">
            Built with passion for education and technology, Learn Bridge is a
            step towards meaningful and structured learning.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default About;