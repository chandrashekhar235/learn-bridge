import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div>
    <footer className="  text-center text-gray-600 text-sm fixed bottom-0 left-0 w-full">
        <div className="flex justify-center gap-10 mb-3 text-lg">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/explore" className="hover:text-white">Explore</Link>
          <Link to="/about" className="hover:text-white">About</Link>
        </div>
        <p>© 2025 LearnBridge. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default Footer
