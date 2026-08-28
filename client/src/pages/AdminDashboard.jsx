import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, DollarSign, BookOpen, Clock, FileText, CheckCircle2,
  XCircle, Loader2, Video, MessageSquare, Star, Settings,
  Bell, Trash2, Edit3, Plus, Eye, EyeOff, Send, Search,
  UserCheck, Lock, ChevronLeft, GraduationCap, ToggleLeft, ToggleRight, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

/* ─── tiny helpers ─────────────────────────────────────── */
const Badge = ({ color, children }) => {
  const cls = {
    amber: 'badge-amber', emerald: 'badge-emerald',
    red: 'badge-red', slate: 'badge-slate', blue: 'badge-blue',
  };
  return <span className={cls[color] || 'badge-slate'}>{children}</span>;
};

/* ─── SETTINGS TAB ─────────────────────────────────────── */
function SettingsTab() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/settings', profile);
      const { token, user: updated } = res.data.data;
      login(token, updated);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) { toast.error('New passwords do not match.'); return; }
    if (pw.newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    setChangingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed successfully!');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setChangingPw(false); }
  };

  return (
    <div className="space-y-8 animate-fadeUp max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-white">Account Settings</h1>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Profile Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required /></div>
          <div><label className="form-label">Email Address</label><input type="email" className="form-input" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required /></div>
          <div><label className="form-label">Phone Number</label><input className="form-input" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="Optional" /></div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes</button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div><label className="form-label">Current Password</label><input type="password" className="form-input" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
          <div><label className="form-label">New Password</label><input type="password" className="form-input" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required /></div>
          <div><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} required /></div>
          <button type="submit" disabled={changingPw} className="btn-danger">{changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Change Password</button>
        </form>
      </div>
    </div>
  );
}

/* ─── ANNOUNCEMENTS TAB ────────────────────────────────── */
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState({ title: '', body: '', is_active: 1 });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/announcements/admin'); setAnnouncements(res.data.data.announcements); }
    catch { toast.error('Failed to load announcements.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ title: '', body: '', is_active: 1 }); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (a) => { setForm({ title: a.title, body: a.body, is_active: a.is_active }); setModal({ open: true, mode: 'edit', data: a }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal.mode === 'create') { await api.post('/announcements/admin', form); toast.success('Announcement created!'); }
      else { await api.put(`/announcements/admin/${modal.data.id}`, form); toast.success('Announcement updated!'); }
      setModal({ open: false, mode: 'create', data: null }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/announcements/admin/${id}`); toast.success('Deleted.'); load(); }
    catch { toast.error('Failed to delete.'); }
  };

  const handleToggle = async (a) => {
    try {
      await api.put(`/announcements/admin/${a.id}`, { ...a, is_active: a.is_active ? 0 : 1 });
      toast.success(a.is_active ? 'Deactivated.' : 'Activated.');
      load();
    } catch { toast.error('Failed to toggle.'); }
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Announcements</h1>
        <button onClick={openCreate} className="btn-primary !py-2.5"><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className={`card p-5 flex gap-4 items-start transition-opacity ${a.is_active ? '' : 'opacity-60'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{a.title}</h3>
                  {a.is_active ? <Badge color="emerald">Active</Badge> : <Badge color="slate">Inactive</Badge>}
                </div>
                <p className="text-sm text-slate-400 mb-2">{a.body}</p>
                <p className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleToggle(a)} className="btn-icon" title={a.is_active ? 'Deactivate' : 'Activate'}>{a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                <button onClick={() => openEdit(a)} className="btn-icon" title="Edit"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(a.id)} className="btn-icon text-red-500 hover:bg-red-500/10 hover:border-red-500/20" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-center py-12 text-slate-500">No announcements yet. Create one above!</p>}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg p-6 animate-scaleIn">
            <h3 className="text-xl font-display font-bold mb-4">{modal.mode === 'create' ? 'New Announcement' : 'Edit Announcement'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div><label className="form-label">Body</label><textarea className="form-input resize-none" rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-blue-600" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                <span className="text-sm font-medium text-slate-300">Active (visible to students)</span>
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── STUDENTS DIRECTORY TAB ───────────────────────────── */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/student/admin/list'); setStudents(res.data.data.students); }
    catch { toast.error('Failed to load students.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student account "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/student/admin/${id}`); toast.success('Student deleted.'); load(); }
    catch { toast.error('Failed to delete student.'); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  );

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Registered Students <span className="text-slate-400 text-lg font-normal">({students.length})</span></h1>
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="form-input !pl-10" placeholder="Search by name, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-800">
                <tr>
                  {['ID', 'Name', 'Email', 'Phone', 'Enrolled', 'Joined', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">#{s.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3 text-slate-400">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/20 text-blue-400 font-bold text-sm">{s.enrolled_courses_count}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(s.id, s.name)} className="btn-icon text-red-500 hover:bg-red-500/10 hover:border-red-500/20"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-12 text-slate-400">{search ? 'No results found.' : 'No students registered yet.'}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── REVIEWS TAB ──────────────────────────────────────── */
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/reviews/admin'); setReviews(res.data.data.reviews); }
    catch { toast.error('Failed to load reviews.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try { await api.post(`/reviews/admin/${id}/approve`); toast.success('Review approved — now live!'); load(); }
    catch { toast.error('Failed to approve.'); }
  };

  const handleUnapprove = async (id) => {
    try { await api.post(`/reviews/admin/${id}/unapprove`); toast.success('Review unpublished.'); load(); }
    catch { toast.error('Failed to unapprove.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try { await api.delete(`/reviews/admin/${id}`); toast.success('Review deleted.'); load(); }
    catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      <h1 className="text-2xl font-display font-bold text-white">Review Moderation</h1>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : (
        <div className="grid md:grid-cols-2 gap-5">
          {reviews.map(review => (
            <div key={review.id} className="card p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white">{review.student_name}</h3>
                  <p className="text-xs text-slate-500">{review.course_title}</p>
                </div>
                <div className="flex items-center gap-0.5 text-gold-500">
                  {Array(review.rating).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
              <p className="text-sm text-slate-400 italic flex-1 mb-4">"{review.comment}"</p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  {review.is_approved
                    ? <button onClick={() => handleUnapprove(review.id)} className="btn-secondary !py-1 !px-3 text-xs text-amber-600"><EyeOff className="w-3 h-3" /> Unpublish</button>
                    : <button onClick={() => handleApprove(review.id)} className="btn-primary !py-1 !px-3 text-xs"><CheckCircle2 className="w-3 h-3" /> Approve</button>
                  }
                  <button onClick={() => handleDelete(review.id)} className="btn-icon !w-8 !h-8 text-red-500 hover:bg-red-500/10 hover:border-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="col-span-2 text-center py-12 text-slate-400">No reviews found.</p>}
        </div>
      )}
    </div>
  );
}

/* ─── CONTACT MESSAGES TAB ─────────────────────────────── */
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? '?read=false' : filter === 'read' ? '?read=true' : '';
      const res = await api.get(`/contact/admin${params}`);
      setMessages(res.data.data.messages);
    } catch { toast.error('Failed to load messages.'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleRead = async (id) => {
    try { await api.put(`/contact/admin/${id}/read`); toast.success('Marked as read.'); load(); }
    catch { toast.error('Failed.'); }
  };

  const handleUnread = async (id) => {
    try { await api.put(`/contact/admin/${id}/unread`); toast.success('Marked as unread.'); load(); }
    catch { toast.error('Failed.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try { await api.delete(`/contact/admin/${id}`); toast.success('Message deleted.'); load(); }
    catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-white">Contact Inbox</h1>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-100 text-blue-400' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-900/50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`card p-5 border-l-4 transition-opacity ${msg.is_read ? 'border-l-slate-200 opacity-75' : 'border-l-blue-500'}`}>
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <h3 className="font-bold text-white">{msg.subject}</h3>
                <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-500 mb-3 font-medium">{msg.name} · {msg.email}{msg.phone ? ` · ${msg.phone}` : ''}</p>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-4">{msg.message}</p>
              <div className="flex gap-2 flex-wrap">
                {msg.is_read
                  ? <button onClick={() => handleUnread(msg.id)} className="btn-secondary !py-1.5 !px-3 text-xs"><Eye className="w-3 h-3" /> Mark Unread</button>
                  : <button onClick={() => handleRead(msg.id)} className="btn-secondary !py-1.5 !px-3 text-xs"><CheckCircle2 className="w-3 h-3" /> Mark Read</button>
                }
                <button onClick={() => handleDelete(msg.id)} className="btn-secondary !py-1.5 !px-3 text-xs text-red-600 hover:border-red-500/20"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-center py-12 text-slate-400">Inbox is empty.</p>}
        </div>
      )}
    </div>
  );
}

/* ─── LIVE CHAT TAB (ADMIN SIDE) ───────────────────────── */
function ChatTab() {
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await api.get('/chat/admin/threads');
      setThreads(res.data.data.threads);
      if (threads.length === 0) setLoadingThreads(false);
    } catch { /* silent */ }
    finally { setLoadingThreads(false); }
  }, []);

  const loadMessages = useCallback(async (studentId) => {
    try {
      const res = await api.get(`/chat/admin/${studentId}`);
      setMessages(res.data.data.messages);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.student_id);
      pollRef.current = setInterval(() => {
        loadMessages(selectedThread.student_id);
        loadThreads();
      }, 4000);
    } else {
      const t = setInterval(loadThreads, 5000);
      return () => clearInterval(t);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedThread, loadMessages, loadThreads]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSendingReply(true);
    try {
      await api.post(`/chat/admin/${selectedThread.student_id}/reply`, { message_text: reply });
      setReply('');
      loadMessages(selectedThread.student_id);
    } catch { toast.error('Failed to send reply.'); }
    finally { setSendingReply(false); }
  };

  return (
    <div className="animate-fadeUp h-[calc(100vh-12rem)] flex flex-col">
      <h1 className="text-2xl font-display font-bold text-white mb-5">Live Chat Support</h1>
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">

        {/* Thread List */}
        <div className={`w-72 border-r border-slate-800 flex flex-col shrink-0 ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-800">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Student Threads</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingThreads ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div> : threads.length === 0 ? (
              <p className="text-center py-10 text-sm text-slate-400">No chats yet.</p>
            ) : threads.map(t => (
              <button key={t.student_id} onClick={() => setSelectedThread(t)} className={`w-full text-left px-4 py-3.5 border-b border-slate-50 hover:bg-slate-900/50 transition-colors ${selectedThread?.student_id === t.student_id ? 'bg-blue-900/20' : ''}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-white text-sm truncate">{t.student_name}</p>
                  {t.unread_count > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{t.unread_count}</span>}
                </div>
                <p className="text-xs text-slate-400 truncate">{t.student_email}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(t.last_activity).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`flex-1 flex flex-col overflow-hidden ${!selectedThread ? 'hidden md:flex' : ''}`}>
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <p className="font-medium">Select a student thread to view messages</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-slate-800 bg-slate-900/50">
                <button onClick={() => setSelectedThread(null)} className="md:hidden btn-icon"><ChevronLeft className="w-4 h-4" /></button>
                <div>
                  <p className="font-bold text-white">{selectedThread.student_name}</p>
                  <p className="text-xs text-slate-500">{selectedThread.student_email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender_role === 'admin' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-900 text-slate-800 rounded-bl-sm'}`}>
                      <p>{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${msg.sender_role === 'admin' ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-slate-400 py-8">No messages yet.</p>}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-800 flex gap-3">
                <input className="form-input flex-1" placeholder="Type your reply…" value={reply} onChange={e => setReply(e.target.value)} />
                <button type="submit" disabled={sendingReply || !reply.trim()} className="btn-primary !px-5">{sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── COURSES TAB (Admin CRUD) ─────────────────────────── */
function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', description: '', fee: '', duration: '', level: 'All Levels', teacher_name: 'Sir Muhammad Huzaifa Siddiqui', is_active: 1, image: null };
  const [form, setForm] = useState(emptyForm);

  // --- BATCH MANAGEMENT STATE ---
  const [batchModal, setBatchModal] = useState({ open: false, course: null });
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotForm, setSlotForm] = useState({ id: null, days_of_week: 'Mon, Wed, Fri', start_time: '18:00', end_time: '19:30', max_capacity: 10, zoom_link: '' });
  const [slotSaving, setSlotSaving] = useState(false);

  const openBatchModal = async (course) => {
    setBatchModal({ open: true, course });
    loadSlots(course.id);
  };

  const loadSlots = async (courseId) => {
    setSlotLoading(true);
    try {
      const res = await api.get(`/courses/admin/slots?course_id=${courseId}`);
      setSlots(res.data.data.slots);
    } catch {
      toast.error('Failed to load batches.');
    } finally {
      setSlotLoading(false);
    }
  };

  const handleSlotSave = async (e) => {
    e.preventDefault();
    setSlotSaving(true);
    try {
      if (slotForm.id) {
        await api.put(`/courses/admin/slots/${slotForm.id}`, slotForm);
        toast.success('Batch updated!');
      } else {
        await api.post('/courses/admin/slots', { ...slotForm, course_id: batchModal.course.id });
        toast.success('Batch added!');
      }
      setSlotForm({ id: null, days_of_week: 'Mon, Wed, Fri', start_time: '18:00', end_time: '19:30', max_capacity: 10, zoom_link: '' });
      loadSlots(batchModal.course.id);
    } catch {
      toast.error('Failed to save batch.');
    } finally {
      setSlotSaving(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('Delete this batch?')) return;
    try {
      await api.delete(`/courses/admin/slots/${id}`);
      toast.success('Batch deleted!');
      loadSlots(batchModal.course.id);
    } catch {
      toast.error('Failed to delete batch.');
    }
  };
  // ------------------------------

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/courses/admin/all'); setCourses(res.data.data.courses); }
    catch { toast.error('Failed to load courses.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, mode: 'create', data: null }); };
  const openEdit = (c) => { setForm({ title: c.title, description: c.description, fee: c.fee, duration: c.duration, level: c.level, teacher_name: c.teacher_name, is_active: c.is_active, image: null }); setModal({ open: true, mode: 'edit', data: c }); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k] !== null) formData.append(k, form[k]);
      });

      if (modal.mode === 'create') { await api.post('/courses/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Course created!'); }
      else { await api.put(`/courses/admin/${modal.data.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); toast.success('Course updated!'); }
      setModal({ open: false, mode: 'create', data: null }); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (c) => {
    try {
      await api.put(`/courses/admin/${c.id}`, { ...c, is_active: c.is_active ? 0 : 1 });
      toast.success(c.is_active ? 'Course deactivated (hidden from public).' : 'Course activated!');
      load();
    } catch { toast.error('Failed to toggle course status.'); }
  };

  const handleDelete = async (c) => {
    if (!confirm(`"${c.title}" course ko permanently delete karna chahte hain? Yeh wapas nahi ho sakta.`)) return;
    try {
      await api.delete(`/courses/admin/${c.id}`);
      toast.success(`"${c.title}" delete ho gaya.`);
      load();
    } catch { toast.error('Course delete karne mein masla hua.'); }
  };

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels', 'IELTS', 'Business'];

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Courses Management</h1>
        <button onClick={openCreate} className="btn-primary !py-2.5"><Plus className="w-4 h-4" /> Add Course</button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-blue-600" /></div> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map(c => (
            <div key={c.id} className={`card overflow-hidden flex flex-col transition-opacity ${c.is_active ? '' : 'opacity-60'}`}>
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white leading-tight">{c.title}</h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">{c.level}</p>
                  </div>
                  {c.is_active
                    ? <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                    : <span className="shrink-0 px-2 py-0.5 bg-slate-900 text-slate-500 text-xs font-bold rounded-full">Inactive</span>
                  }
                </div>
                <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-sm mb-4 border-t border-slate-800 pt-3">
                  <span className="text-slate-500">Fee / month</span>
                  <span className="text-xl font-bold text-white">Rs. {Number(c.fee).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Clock className="w-3.5 h-3.5" /> {c.duration}
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleToggle(c)} className={`btn-icon flex-1 justify-center gap-1.5 text-xs font-medium ${c.is_active ? 'text-amber-600 hover:bg-amber-50 hover:border-amber-200' : 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'}`} title={c.is_active ? 'Deactivate' : 'Activate'}>
                    {c.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openBatchModal(c)} className="btn-icon text-blue-400 hover:bg-blue-900/20 hover:border-blue-500/30" title="Manage Batches"><Calendar className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(c)} className="btn-icon" title="Edit"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c)} className="btn-icon text-red-500 hover:bg-red-500/10 hover:border-red-500/20" title="Delete Course"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="col-span-3 text-center py-12 text-slate-400">No courses yet. Create one above!</p>}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl my-6 p-6 animate-scaleIn shadow-2xl">
            <h3 className="text-xl font-display font-bold mb-5">{modal.mode === 'create' ? 'Add New Course' : 'Edit Course'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="form-label">Course Image (optional)</label>
                <input type="file" accept="image/png, image/jpeg, image/webp" className="form-input text-sm" onChange={e => setForm({ ...form, image: e.target.files[0] })} />
                <p className="text-xs text-slate-500 mt-1">Leave empty to keep current image (on edit).</p>
              </div>
              <div><label className="form-label">Course Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Spoken English" required /></div>
              <div><label className="form-label">Description</label><textarea className="form-input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief course description…" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Monthly Fee (Rs.)</label><input type="number" min="0" className="form-input" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} placeholder="e.g. 2500" required /></div>
                <div><label className="form-label">Duration</label><input className="form-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 Months" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Level</label>
                  <select className="form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Teacher Name</label><input className="form-input" value={form.teacher_name} onChange={e => setForm({ ...form, teacher_name: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded bg-slate-800 border-slate-700" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
                <span className="text-sm font-medium text-slate-300">Active (visible to students on the Courses page)</span>
              </label>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {modal.mode === 'create' ? 'Create Course' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Batch Management Modal */}
      {batchModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl my-6 p-6 animate-scaleIn shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="text-xl font-display font-bold text-white">Manage Batches: {batchModal.course.title}</h3>
              <button onClick={() => setBatchModal({ open: false, course: null })} className="text-slate-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Add/Edit Slot Form */}
              <form onSubmit={handleSlotSave} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
                <h4 className="font-semibold text-blue-400 mb-2">{slotForm.id ? 'Edit Batch' : 'Add New Batch'}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">Days (e.g. MWF, TTS)</label><input className="form-input" value={slotForm.days_of_week} onChange={e => setSlotForm({...slotForm, days_of_week: e.target.value})} required /></div>
                  <div><label className="form-label">Max Capacity</label><input type="number" className="form-input" value={slotForm.max_capacity} onChange={e => setSlotForm({...slotForm, max_capacity: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="form-label">Start Time</label><input type="time" className="form-input" value={slotForm.start_time} onChange={e => setSlotForm({...slotForm, start_time: e.target.value})} required /></div>
                  <div><label className="form-label">End Time</label><input type="time" className="form-input" value={slotForm.end_time} onChange={e => setSlotForm({...slotForm, end_time: e.target.value})} required /></div>
                </div>
                <div><label className="form-label">Zoom Link (Optional)</label><input type="url" className="form-input" value={slotForm.zoom_link || ''} onChange={e => setSlotForm({...slotForm, zoom_link: e.target.value})} placeholder="https://zoom.us/..." /></div>
                <div className="flex justify-end gap-2 pt-2">
                  {slotForm.id && <button type="button" onClick={() => setSlotForm({ id: null, days_of_week: 'Mon, Wed, Fri', start_time: '18:00', end_time: '19:30', max_capacity: 10, zoom_link: '' })} className="btn-secondary text-xs py-1.5">Cancel Edit</button>}
                  <button type="submit" disabled={slotSaving} className="btn-primary text-xs py-1.5">{slotSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null} {slotForm.id ? 'Update Batch' : 'Add Batch'}</button>
                </div>
              </form>

              {/* Slots List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Existing Batches</h4>
                {slotLoading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div> : (
                  slots.length === 0 ? <p className="text-slate-400 text-sm">No batches found for this course.</p> : (
                    slots.map(s => (
                      <div key={s.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-white">{s.days_of_week}</div>
                          <div className="text-sm text-slate-400">{s.start_time.slice(0,5)} - {s.end_time.slice(0,5)} | Capacity: {s.max_capacity}</div>
                          {s.zoom_link && <div className="text-xs text-blue-400 mt-1 truncate max-w-[200px]">{s.zoom_link}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSlotForm(s)} className="btn-icon text-slate-300 hover:text-blue-400"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSlot(s.id)} className="btn-icon text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ADMIN DASHBOARD ─────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [approveModal, setApproveModal] = useState({ open: false, bookingId: null, zoomLink: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null, reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/bookings/admin/analytics'); setStats(res.data.data); }
    catch { toast.error('Failed to load analytics.'); }
    finally { setLoading(false); }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/bookings/admin'); setBookings(res.data.data.bookings); }
    catch { toast.error('Failed to load bookings.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    else if (activeTab === 'bookings') loadBookings();
  }, [activeTab, loadAnalytics, loadBookings]);

  const handleApproveBooking = async (e) => {
    e.preventDefault(); setActionLoading(true);
    try {
      await api.post(`/bookings/admin/${approveModal.bookingId}/approve`, { zoom_meeting_link: approveModal.zoomLink });
      toast.success('Booking approved!');
      setApproveModal({ open: false, bookingId: null, zoomLink: '' });
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to approve.'); }
    finally { setActionLoading(false); }
  };

  const handleRejectBooking = async (e) => {
    e.preventDefault(); setActionLoading(true);
    try {
      await api.post(`/bookings/admin/${rejectModal.bookingId}/reject`, { rejection_reason: rejectModal.reason });
      toast.success('Booking rejected.');
      setRejectModal({ open: false, bookingId: null, reason: '' });
      loadBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject.'); }
    finally { setActionLoading(false); }
  };

  const tabs = [
    { id: 'analytics',      label: 'Overview',       icon: FileText },
    { id: 'bookings',       label: 'Enrollments',    icon: BookOpen },
    { id: 'courses',        label: 'Courses',         icon: GraduationCap },
    { id: 'reviews',        label: 'Reviews',         icon: Star },
    { id: 'messages',       label: 'Contact Inbox',  icon: MessageSquare },
    { id: 'announcements',  label: 'Announcements',  icon: Bell },
    { id: 'students',       label: 'Students',        icon: Users },
    { id: 'chat',           label: 'Live Chat',       icon: Send },
    { id: 'settings',       label: 'Settings',        icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-slate-900/50">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shrink-0">
        <div className="p-6 pb-4 border-b border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Admin Panel</p>
          <h2 className="font-display font-bold text-white truncate">{user.name}</h2>
        </div>
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${activeTab === tab.id ? 'bg-blue-900/20 text-blue-400 shadow-sm' : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'}`}>
                <Icon className="w-4 h-4 shrink-0" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-20 bg-slate-900 border-b border-slate-800 overflow-x-auto shadow-sm">
        <div className="flex p-2 gap-1.5 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-900/20 text-blue-400' : 'text-slate-400 hover:bg-slate-900/50'}`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 md:p-8 overflow-y-auto mt-14 md:mt-0">

        {/* Analytics */}
        {activeTab === 'analytics' && (
          loading && !stats ? <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> :
          stats && (
            <div className="space-y-8 animate-fadeUp">
              <h1 className="text-2xl font-display font-bold text-white">Dashboard Overview</h1>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Students', value: stats.total_students, icon: Users, color: 'blue', top: 'border-t-blue-500' },
                  { label: 'Total Revenue', value: `Rs. ${Number(stats.total_revenue).toLocaleString()}`, icon: DollarSign, color: 'emerald', top: 'border-t-emerald-500' },
                  { label: 'Pending Approvals', value: stats.pending_approvals, icon: Clock, color: 'amber', top: 'border-t-amber-500' },
                  { label: 'Active Batches', value: stats.active_batches, icon: BookOpen, color: 'purple', top: 'border-t-purple-500' },
                ].map(({ label, value, icon: Icon, color, top }) => (
                  <div key={label} className={`card p-6 border-t-4 ${top}`}>
                    <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-4`}><Icon className={`w-5 h-5 text-${color}-600`} /></div>
                    <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
                    <div className="text-sm font-medium text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"><MessageSquare className="w-5 h-5" /></div>
                    <div><div className="text-xl font-bold">{stats.unread_messages}</div><div className="text-sm text-slate-500">Unread Messages</div></div>
                  </div>
                  <button onClick={() => setActiveTab('messages')} className="text-sm font-bold text-blue-600 hover:underline">View Inbox</button>
                </div>
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><Star className="w-5 h-5 fill-current" /></div>
                    <div><div className="text-xl font-bold">{stats.pending_reviews}</div><div className="text-sm text-slate-500">Reviews Pending</div></div>
                  </div>
                  <button onClick={() => setActiveTab('reviews')} className="text-sm font-bold text-blue-600 hover:underline">Moderate</button>
                </div>
              </div>
            </div>
          )
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          loading ? <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
            <div className="space-y-6 animate-fadeUp">
              <h1 className="text-2xl font-display font-bold text-white">Enrollment Approvals</h1>
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="card p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono font-bold bg-slate-900 px-3 py-1 rounded-lg text-slate-300">{booking.booking_ref}</span>
                          {booking.status === 'pending' && <Badge color="amber">Pending</Badge>}
                          {booking.status === 'approved' && <Badge color="emerald">Approved</Badge>}
                          {booking.status === 'rejected' && <Badge color="red">Rejected</Badge>}
                        </div>
                        <h3 className="font-bold text-lg text-white">{booking.student_name}</h3>
                        <p className="text-sm text-slate-500">{booking.student_email} · {booking.student_phone}</p>
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <p className="font-semibold text-white text-sm">{booking.course_title}</p>
                          <p className="text-sm text-slate-400">{booking.days_of_week} | {booking.start_time?.slice(0, 5)} – {booking.end_time?.slice(0, 5)}</p>
                        </div>
                      </div>
                      <div className="w-full lg:w-72 bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 flex flex-col">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment</p>
                        <p className="text-sm"><span className="font-semibold text-slate-300">Method:</span> {booking.payment_method}</p>
                        <p className="text-sm"><span className="font-semibold text-slate-300">TID:</span> <span className="font-mono bg-slate-900 px-1 rounded">{booking.transaction_id}</span></p>
                        <a href={api.defaults.baseURL.replace('/api', '') + booking.receipt_image_url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center py-2 px-4 bg-slate-900 border text-slate-500 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-900/20 transition-colors">View Receipt</a>
                        {booking.status === 'pending' && (
                          <div className="mt-auto pt-4 flex gap-2">
                            <button onClick={() => setRejectModal({ open: true, bookingId: booking.id, reason: '' })} className="btn-secondary !py-2 flex-1 text-sm text-red-600">Reject</button>
                            <button onClick={() => setApproveModal({ open: true, bookingId: booking.id, zoomLink: '' })} className="btn-emerald !py-2 flex-1 text-sm !shadow-none">Approve</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-center py-12 text-slate-400">No bookings found.</p>}
              </div>
            </div>
          )
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && <ReviewsTab />}

        {/* Contact Messages */}
        {activeTab === 'messages' && <MessagesTab />}

        {/* Announcements */}
        {activeTab === 'announcements' && <AnnouncementsTab />}

        {/* Courses */}
        {activeTab === 'courses' && <CoursesTab />}

        {/* Students Directory */}
        {activeTab === 'students' && <StudentsTab />}

        {/* Live Chat */}
        {activeTab === 'chat' && <ChatTab />}

        {/* Settings */}
        {activeTab === 'settings' && <SettingsTab />}

      </div>

      {/* Approve Modal */}
      {approveModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 animate-scaleIn">
            <h3 className="text-xl font-display font-bold mb-2">Approve Booking</h3>
            <p className="text-sm text-slate-500 mb-5">Payment verified. Provide the Zoom link for this batch.</p>
            <form onSubmit={handleApproveBooking}>
              <div className="mb-5"><label className="form-label">Zoom Meeting Link</label><input required type="url" className="form-input" value={approveModal.zoomLink} onChange={e => setApproveModal({ ...approveModal, zoomLink: e.target.value })} placeholder="https://zoom.us/j/..." /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setApproveModal({ open: false, bookingId: null, zoomLink: '' })} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-emerald">{actionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 animate-scaleIn">
            <h3 className="text-xl font-display font-bold text-red-600 mb-4">Reject Booking</h3>
            <form onSubmit={handleRejectBooking}>
              <div className="mb-5"><label className="form-label">Reason for Rejection</label><textarea required rows={3} className="form-input resize-none" value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })} placeholder="e.g. Invalid receipt, amount mismatch…" /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setRejectModal({ open: false, bookingId: null, reason: '' })} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-danger">{actionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Reject Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
