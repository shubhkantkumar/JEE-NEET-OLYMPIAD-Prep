import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Atom, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  user: any;
  logout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? 'text-black font-medium border-b-2 border-black pb-1' 
    : 'text-gray-500 hover:text-black transition-colors pb-1';

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.hash = '/'}>
              <div className="bg-black p-2 mr-3">
                <Atom className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-widest uppercase text-black">PREP<span className="font-light">MASTER</span></span>
            </div>
            <div className="hidden sm:ml-12 sm:flex sm:space-x-8 items-center">
              <Link to="/" className={isActive('/')}>HOME</Link>
              {user && <Link to="/dashboard" className={isActive('/dashboard')}>DASHBOARD</Link>}
              {user && <Link to="/leaderboard" className={isActive('/leaderboard')}>RANKING</Link>}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-6">
                <span className="text-sm text-gray-900 tracking-wide uppercase">{user.name}</span>
                <button
                  onClick={logout}
                  className="inline-flex items-center text-xs font-medium tracking-widest text-gray-500 hover:text-black uppercase transition-colors"
                >
                  <LogOut className="h-3 w-3 mr-1" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-6 items-center">
                <Link to="/login" className="text-gray-500 hover:text-black text-sm tracking-widest uppercase transition-colors">Login</Link>
                <Link to="/signup" className="bg-black text-white px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-gray-800 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 text-black hover:bg-gray-50 focus:outline-none"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100">
          <div className="pt-4 pb-4 space-y-2 px-4">
            <Link to="/" className="block py-2 text-sm font-medium text-black uppercase tracking-wide">Home</Link>
            {user && <Link to="/dashboard" className="block py-2 text-sm font-medium text-black uppercase tracking-wide">Dashboard</Link>}
            {user && <Link to="/leaderboard" className="block py-2 text-sm font-medium text-black uppercase tracking-wide">Ranking</Link>}
            {!user && <Link to="/login" className="block py-2 text-sm font-medium text-black uppercase tracking-wide">Login</Link>}
          </div>
        </div>
      )}
    </nav>
  );
};