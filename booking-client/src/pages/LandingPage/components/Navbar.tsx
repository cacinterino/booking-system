import { Link } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  scrolled: boolean;
}

export function Navbar({ scrolled }: NavbarProps) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-paper/85 backdrop-blur-md border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center group">
            <span
              className={`font-display text-2xl font-bold tracking-tight transition-colors ${
                scrolled ? 'text-ink' : 'text-paper-white'
              }`}
            >
              Booked<span className="text-brass">.</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              to="/login"
              className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                scrolled ? 'text-slate hover:text-ink' : 'text-paper-white/85 hover:text-paper-white'
              }`}
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
