import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, Video, Clock, CheckCircle2, XCircle, Bell, Loader2,
  Send, MessageSquare, Settings, UserCheck, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

/* ─── CHAT WIDGET (Student Side) ──────────────────────── */
function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);
  const endRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.get('/chat/student');
      setMessages(res.data.data.messages);
    } catch { /* silent on poll */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await api.post('/chat/student/send', { message_text: text });
      setText('');
      loadMessages();
    } catch { toast.error('Failed to send message.'); }
    finally { setSending(false); }
  };

  return (
    <div className="card overflow-hidden flex flex-col" style={{ height: '520px' }}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Message Sir Huzaifa</h3>
        <p className="text-blue-100 text-xs mt-0.5">Ask any question — Admin usually replies within a few hours.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 pt-10">
            <MessageSquare className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium">No messages yet. Say hello! 👋</p>
          </div>
        ) : messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender_role === 'student' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender_role === 'admin' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mr-2 mt-1 shrink-0">SH</div>
            )}
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${msg.sender_role === 'student' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}>
              <p>{msg.message_text}</p>
              <p className={`text-xs mt-1 ${msg.sender_role === 'student' ? 'text-blue-200' : 'text-slate-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.sender_role === 'admin' && ' · Sir Huzaifa'}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
        <input
          className="form-input flex-1 !py-2.5"
          placeholder="Type your message…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary !px-4 !py-2.5">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

/* ─── SETTINGS TAB (Student) ───────────────────────────── */
function StudentSettings() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await api.put('/auth/settings', profile);
      const { token, user: updated } = res.data.data;
      login(token, updated);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    if (pw.newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed!');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password.'); }
    finally { setChangingPw(false); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Profile Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required /></div>
          <div><label className="form-label">Email Address</label><input type="email" className="form-input" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required /></div>
          <div><label className="form-label">Phone Number</label><input className="form-input" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Optional" /></div>
          <button type="submit" disabled={saving} className="btn-primary">{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile</button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div><label className="form-label">Current Password</label><input type="password" className="form-input" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
          <div><label className="form-label">New Password</label><input type="password" className="form-input" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required /></div>
          <div><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} required /></div>
          <button type="submit" disabled={changingPw} className="btn-danger">{changingPw && <Loader2 className="w-4 h-4 animate-spin" />} Change Password</button>
        </form>
      </div>
    </div>
  );
}

/* ─── MAIN STUDENT DASHBOARD ───────────────────────────── */
export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => {
        setBookings(res.data.data.bookings);
        setAnnouncements(res.data.data.announcements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="py-24 flex items-center justify-center">
      <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
    </div>
  );

  const tabs = [
    { id: 'courses',  label: 'My Courses',  icon: BookOpen },
    { id: 'chat',     label: 'Messages',     icon: MessageSquare },
    { id: 'settings', label: 'Settings',     icon: Settings },
  ];

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 animate-fadeUp">
          <h1 className="text-3xl font-display font-bold text-white">Welcome back, {user.name} 👋</h1>
          <p className="text-slate-400 mt-1">Manage your courses, messages, and account settings.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fadeUp">
            {/* Main: Bookings */}
            <div className="lg:col-span-2 space-y-6">
              {bookings.length === 0 ? (
                <div className="card p-14 text-center border-dashed border-2 border-slate-800">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-200 mb-2">No courses yet</h3>
                  <p className="text-slate-400">Explore our courses and enroll to get started.</p>
                </div>
              ) : bookings.map(booking => (
                <div key={booking.id} className="card overflow-hidden">
                  {booking.status === 'pending' && (
                    <div className="bg-amber-50 text-amber-700 px-6 py-3 text-sm font-medium border-b border-amber-200 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Payment Verification Pending · Ref: {booking.booking_ref}
                    </div>
                  )}
                  {booking.status === 'rejected' && (
                    <div className="bg-red-50 text-red-700 px-6 py-3 text-sm font-medium border-b border-red-200 flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Payment Rejected: {booking.rejection_reason}
                    </div>
                  )}
                  {booking.status === 'approved' && (
                    <div className="bg-emerald-50 text-emerald-700 px-6 py-3 text-sm font-medium border-b border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Enrollment Active</div>
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-white rounded border border-emerald-200">{booking.booking_ref}</span>
                    </div>
                  )}
                  <div className="p-6 md:p-8">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{booking.level}</span>
                    <h3 className="text-2xl font-display font-bold text-white mt-1 mb-4">{booking.course_title}</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Schedule</div>
                        <div className="font-semibold text-slate-200 text-sm">{booking.days_of_week}</div>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Time</div>
                        <div className="font-semibold text-slate-200 text-sm">{booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)}</div>
                      </div>
                    </div>
                    {booking.status === 'approved' ? (
                      <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-white flex items-center gap-2"><Video className="w-5 h-5 text-blue-400" /> Live Class Link</h4>
                          <p className="text-sm text-blue-200/70 mt-0.5">Join at your scheduled time.</p>
                        </div>
                        {booking.zoom_meeting_link
                          ? <a href={booking.zoom_meeting_link} target="_blank" rel="noopener noreferrer" className="btn-primary whitespace-nowrap">Join Zoom Meeting</a>
                          : <div className="px-4 py-2 bg-slate-800 text-amber-400 text-sm font-medium rounded-lg border border-amber-500/20">Link pending from instructor</div>
                        }
                      </div>
                    ) : (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                        <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">Zoom link will appear here once payment is approved.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar: Announcements */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" /> Announcements
              </h2>
              <div className="card overflow-hidden">
                {announcements.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm">No new announcements.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {announcements.map((ann, idx) => (
                      <div key={idx} className="p-5 hover:bg-slate-800/50 transition-colors">
                        {ann.course_id === null && (
                          <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded mb-2 border border-blue-500/20">Global</span>
                        )}
                        <h4 className="font-bold text-white mb-1 text-sm leading-tight">{ann.title}</h4>
                        <p className="text-sm text-slate-400 mb-2">{ann.body}</p>
                        <p className="text-xs text-slate-500">{new Date(ann.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="max-w-2xl animate-fadeUp">
            <ChatWidget />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-fadeUp">
            <StudentSettings />
          </div>
        )}

      </div>
    </div>
  );
}
