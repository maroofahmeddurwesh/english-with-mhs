import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  const [isRegister, setIsRegister] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'admin') endpoint = '/auth/admin/login';
      else if (isRegister) endpoint = '/auth/student/register';
      else endpoint = '/auth/student/login';

      const res = await api.post(endpoint, formData);
      const { token, user } = res.data.data;
      
      login(token, user);
      toast.success(res.data.message || 'Login successful!');
      
      const from = location.state?.from?.pathname || (user.role === 'student' ? '/dashboard' : '/admin/dashboard');
      navigate(from, { replace: true });
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fadeUp">
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src="/icon.png" alt="English With MHS" className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.4)] mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <div className="card overflow-hidden shadow-xl shadow-black/50">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/50">
            <button 
              className={`flex-1 py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'student' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-900/80' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setActiveTab('student'); setIsRegister(false); }}
            >
              <User className="w-4 h-4" /> Student Portal
            </button>
            <button 
              className={`flex-1 py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-colors ${activeTab === 'admin' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-900/80' : 'text-slate-400 hover:text-slate-200'}`}
              onClick={() => { setActiveTab('admin'); setIsRegister(false); }}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Access
            </button>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {activeTab === 'student' && isRegister && (
                <>
                  <div>
                    <label className="form-label">Full Name</label>
                    <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ali Ahmed" />
                  </div>
                  <div>
                    <label className="form-label">Phone Number (Optional)</label>
                    <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0300-0000000" />
                  </div>
                </>
              )}

              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required type="email" className="form-input pl-11" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input required type="password" className="form-input pl-11" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 ${
                activeTab === 'admin' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
              }`}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {activeTab === 'student' && (
              <div className="mt-6 text-center text-sm text-slate-400">
                {isRegister ? (
                  <>Already have an account? <button onClick={() => setIsRegister(false)} className="text-blue-400 font-bold hover:underline">Sign In</button></>
                ) : (
                  <>New student? <button onClick={() => setIsRegister(true)} className="text-blue-400 font-bold hover:underline">Create an account</button></>
                )}
              </div>
            )}
            
            {activeTab === 'admin' && (
              <div className="mt-6 p-3 bg-amber-500/10 rounded-lg text-xs text-amber-400 border border-amber-500/20 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                This area is restricted to authorized teaching staff only.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
