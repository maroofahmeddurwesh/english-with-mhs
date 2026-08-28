import { useState, useEffect } from 'react';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ReviewCard from '../components/ReviewCard';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ student_name: '', course_title: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/reviews')
      .then(res => setReviews(res.data.data.reviews))
      .catch(() => toast.error('Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/reviews/submit', formData);
      toast.success(res.data.message, { duration: 5000 });
      setFormData({ student_name: '', course_title: '', rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img src="/reviews-hero.jpg" alt="Student Reviews" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        
        <div className="section-container relative z-10 text-center animate-fadeUp">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Success Stories</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Read what our students have achieved after joining English With MHS.
          </p>
        </div>
      </section>

      <div className="section-container py-24 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          
          {/* Submit Review Form */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-white">Write a Review</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Your Name</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="Ali Ahmed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Course Taken</label>
                  <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" value={formData.course_title} onChange={e => setFormData({...formData, course_title: e.target.value})} placeholder="Spoken English Fluency" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-800'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Your Review</label>
                  <textarea required rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="Share your experience..."></textarea>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 shadow-lg shadow-blue-500/20 py-3">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
