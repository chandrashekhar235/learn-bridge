import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <main className="flex-grow w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mt-10 mb-4">
            About Learn Bridge
          </h1>

          <p className="text-gray-400 text-center text-base sm:text-lg mb-12">
            Bridging the gap between learning and real-world skills
          </p>

          {/* What is Learn Bridge */}
          <section className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              What is Learn Bridge?
            </h2>

            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              Learn Bridge is a learning platform built with the goal of making
              education simple, practical, and effective. We focus on strong
              fundamentals, real-world application, and clarity of concepts so
              learners don’t just memorize — they understand.
            </p>
          </section>

          {/* Founders Section */}
          <section className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-md mb-12 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-10">
              Meet the Builders
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">

              {/* Founder 1 */}
              <div className="flex flex-col items-center w-full md:w-auto">
                <img
                  src="/sahil.jpeg"
                  alt="Chandra Shekhar"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full shadow-lg"
                />

                <a
                  href="https://www.linkedin.com/in/chandra-shekhar-a29789284/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-400 hover:underline text-lg"
                >
                  Chandra Shekhar
                </a>

                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                  Full-Stack Web Developer
                </p>
              </div>

              {/* Founder 2 */}
              <div className="flex flex-col items-center w-full md:w-auto">
                <img
                  src="/chetna.jpeg"
                  alt="Chetna Singh"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full shadow-lg"
                />

                <a
                  href="https://www.linkedin.com/in/singh-chetna-webdeveloper/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-blue-400 hover:underline text-lg"
                >
                  Chetna Singh
                </a>

                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                  Full-Stack Web Developer
                </p>
              </div>

            </div>

            <p className="text-gray-400 mt-10 text-sm sm:text-base max-w-2xl mx-auto">
              Built with passion for education and technology, Learn Bridge is a
              step towards meaningful and structured learning.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;