import { Star, Quote } from 'lucide-react';

export default function ReviewCard({ review }) {
  const { student_name, course_title, rating, comment, created_at } = review;
  
  // Format date
  const date = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
      {/* Decorative Quote Icon */}
      <Quote className="absolute top-4 right-4 w-12 h-12 text-slate-800 opacity-30 group-hover:text-blue-500/20 group-hover:scale-110 transition-all duration-300" />
      
      <div className="flex gap-1 mb-4 relative z-10">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-800'}`} 
          />
        ))}
      </div>
      
      <p className="text-slate-300 mb-6 relative z-10 leading-relaxed italic">"{comment}"</p>
      
      <div className="flex items-center gap-3 border-t border-slate-800 pt-4 mt-auto relative z-10">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold font-display shrink-0 border border-slate-700">
          {student_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">{student_name}</h4>
          <p className="text-xs text-slate-400 font-medium">{course_title}</p>
        </div>
      </div>
    </div>
  );
}
