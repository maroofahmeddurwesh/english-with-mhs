import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 pt-16 pb-8 text-slate-300 border-t border-navy-800">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-display">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-white leading-tight">English With MHS</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students globally to master the English language with confidence through expert guidance by Sir Muhammad Huzaifa Siddiqui.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/share/19EgKBpwwf/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/english_with_mhsigsh=Y3d2emVic3Bld2Nn&igsi=Y3d2emVic3Bld2Nn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@englishwithmhs7907?si=zaxlKt4Xax0SaEtd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-slate-400 hover:text-blue-400 transition-colors">About Sir Huzaifa</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-blue-400 transition-colors">Browse Courses</Link></li>
              <li><Link to="/reviews" className="text-slate-400 hover:text-blue-400 transition-colors">Student Success</Link></li>
              <li><Link to="/track" className="text-slate-400 hover:text-blue-400 transition-colors">Track Admission</Link></li>
            </ul>
          </div>

          {/* Popular Courses */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6">Popular Courses</h3>
            <ul className="space-y-3">
              <li><Link to="/courses" className="text-slate-400 hover:text-blue-400 transition-colors">Spoken English Fluency</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-blue-400 transition-colors">IELTS Masterclass</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-blue-400 transition-colors">Business Communication</Link></li>
              <li><Link to="/courses" className="text-slate-400 hover:text-blue-400 transition-colors">Grammar Foundation</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <span>Available Online globally via Zoom Classes</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="https://wa.me/qr/ZLDJ7F6SI2HTN1" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">+92 331 2304820</a>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <a href="mailto:mhshuzaifa722@gmail.com" className="hover:text-blue-400 transition-colors">mhshuzaifa722@gmail.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-navy-800 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} English With MHS. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link to="/login" className="hover:text-blue-400 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
