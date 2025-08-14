import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const NavBar = ({ onLoginClick }) => {
  return (
    <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-teal-200 dark:border-gray-700">
      <div className="container mx-auto px-10">
        <nav className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🦷</span>
            </div>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              AI Dental Scribe
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              href="#demo"
            >
              Demo
            </a>
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              href="#pricing"
            >
              Pricing
            </a>
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              href="#contact"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}
            <button
              onClick={onLoginClick}
              className="px-6 py-2 text-s  text-teal-600 border border-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
            >
              Login
            </button>
            <Link
              to="/signup"
              className="px-4 py-2 text-s bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
