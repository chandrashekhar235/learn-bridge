import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="w-full text-center text-gray-600 text-sm py-6 mt-auto">
      <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-3 text-base sm:text-lg">
        <Link to="/" className="hover:text-white">Home</Link>
        <Link to="/explore" className="hover:text-white">Explore</Link>
        <Link to="/about" className="hover:text-white">About</Link>
      </div>
      <p className="text-xs sm:text-sm">© {new Date().getFullYear()} LearnBridge. All rights reserved.</p>
    </footer>
  )
}

export default Footer
