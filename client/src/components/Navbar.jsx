import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isStudent, isAdmin } = useAuth();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/icon.png" alt="English With MHS" className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-white leading-tight">English With MHS</span>
              <span className="text-xs font-medium text-slate-400 tracking-wide">Sir Muhammad Huzaifa</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive(link.path)
                    ? 'text-white bg-slate-800 border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-800 border border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isAdmin() ? "/admin/dashboard" : "/dashboard"}
                  className="px-4 py-2 rounded-lg font-medium text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 bg-slate-900 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={logout} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary !py-2.5 !px-5 text-sm shadow-lg shadow-blue-500/20">
                <User className="w-4 h-4" />
                Student Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-slate-950 border-b border-slate-800 shadow-xl animate-fadeUp">
          <div className="px-4 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium ${
                  isActive(link.path)
                    ? 'text-white bg-slate-800 border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-slate-800 my-2" />
            {user ? (
              <>
                <Link
                  to={isAdmin() ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl font-medium text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-left"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full justify-center shadow-lg shadow-blue-500/20"
              >
                Student Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
