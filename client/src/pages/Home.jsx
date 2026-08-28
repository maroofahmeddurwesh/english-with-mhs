import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, GraduationCap, Globe, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import ReviewCard from '../components/ReviewCard';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch some preview courses
    api.get('/courses')
      .then(res => setCourses(res.data.data.courses.slice(0, 3)))
      .catch(console.error);

    // Fetch top reviews
    api.get('/reviews')
      .then(res => setReviews(res.data.data.reviews.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-32 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img src="/home-hero.jpg" alt="English With MHS" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent"></div>
        </div>

        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="section-container relative z-10 text-center animate-fadeUp mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide">Admissions Open for September 2026 Batches</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight text-white">
            Master English with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Sir Muhammad Huzaifa</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of successful students who have transformed their careers and confidence through our premium online spoken English and IELTS programs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/courses" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 shadow-lg shadow-blue-500/20">
              Explore Courses <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Why Choose English With MHS?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We focus on practical fluency, not just textbook rules.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors text-center group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Live Global Classes</h3>
              <p className="text-slate-400 leading-relaxed">Interactive Zoom sessions accessible from anywhere in the world.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/50 transition-colors text-center group">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Expert Instruction</h3>
              <p className="text-slate-400 leading-relaxed">Learn directly from Sir Huzaifa, a renowned English language expert.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-amber-500/50 transition-colors text-center group">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">Guaranteed Results</h3>
              <p className="text-slate-400 leading-relaxed">Practical modules designed to build confidence and fluency fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Featured Courses</h2>
              <p className="text-slate-400">Kickstart your language journey today.</p>
            </div>
            <Link to="/courses" className="btn-secondary bg-slate-800 text-white hover:bg-slate-700 border-slate-700">
              View All Courses
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30 group">
                <div className="h-48 bg-slate-900 relative p-6 flex flex-col justify-end overflow-hidden">
                  {course.image_url ? (
                    <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-blue-400 border border-slate-800">
                    {course.level}
                  </div>
                  <BookOpen className="w-10 h-10 text-slate-700 absolute top-4 left-4 group-hover:text-blue-500/50 transition-colors" />
                  <h3 className="text-xl font-display font-bold text-white relative z-10">{course.title}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3">{course.description}</p>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                      <span className="text-slate-500 font-medium text-sm">Duration: <span className="text-slate-300">{course.duration}</span></span>
                      <span className="text-lg font-bold text-emerald-400">Rs. {Number(course.fee).toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ month</span></span>
                    </div>
                    <Link to="/courses" className="btn-primary w-full shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20">Enroll Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-24">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Student Success Stories</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Hear what our students have to say about their experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/reviews" className="btn-secondary bg-slate-800 text-white hover:bg-slate-700 border-slate-700">Read More Reviews</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
