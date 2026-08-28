import { useState } from 'react';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/contact/submit', formData);
      toast.success(res.data.message, { duration: 5000 });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img src="/contact-hero.jpg" alt="Contact Us" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        
        <div className="section-container relative z-10 text-center animate-fadeUp">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Touch</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Have questions about our courses or admission process? We're here to help.
          </p>
        </div>
      </section>

      <div className="section-container py-24 max-w-6xl">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl shadow-xl">
              <h3 className="font-display font-bold text-2xl text-white mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Phone & WhatsApp</h4>
                    <a href="https://wa.me/qr/ZLDJ7F6SI2HTN1" target="_blank" rel="noopener noreferrer" className="block text-slate-400 mt-1 hover:text-blue-400 transition-colors">+92 331 2304820</a>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Email Address</h4>
                    <a href="mailto:mhshuzaifa722@gmail.com" className="block text-slate-400 mt-1 hover:text-blue-400 transition-colors">mhshuzaifa722@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Location</h4>
                    <p className="text-slate-400 mt-1">Available globally via online Zoom classes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3 bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 md:p-10 rounded-2xl shadow-2xl">
            <h3 className="font-display font-bold text-2xl text-white mb-8">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ali Ahmed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                  <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ali@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="How can we help?" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Message</label>
                <textarea required rows="5" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Write your message here..."></textarea>
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto px-8 shadow-lg shadow-blue-500/20 py-3 mt-4">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
