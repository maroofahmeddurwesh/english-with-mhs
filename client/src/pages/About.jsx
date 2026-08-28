import { Link } from 'react-router-dom';
import {
  BookOpen, Mic, Brain, Globe, Building2, HeartPulse,
  MessageSquare, Award, Users, TrendingUp, Laptop,
  ChevronRight, Quote, Briefcase, GraduationCap, Star
} from 'lucide-react';

const timeline = [
  { org: 'Linguaphile Academy', role: 'English Language Trainer & IELTS Instructor', detail: 'Guided 1,500+ students to their target IELTS bands through focused band-specific preparation.', icon: GraduationCap, color: 'blue' },
  { org: 'ZAS College of Art & Design', role: 'Head of English Department & IELTS Lead', detail: 'Led curriculum development, faculty mentoring, and standardised English assessments institute-wide.', icon: BookOpen, color: 'indigo' },
  { org: 'Aptech', role: 'English Language & Corporate Communication Trainer', detail: 'Delivered phonetics, public speaking, and soft-skills modules to tech and business professionals.', icon: Briefcase, color: 'violet' },
  { org: 'Horizon Nursing Institute', role: 'English & IELTS Instructor — Healthcare', detail: 'Specialised training in medical terminology, global nursing standards, and IELTS for healthcare.', icon: HeartPulse, color: 'pink' },
];

const corporate = [
  { org: 'J. (Corporate Division)', role: 'Mindset Facilitator & Guest Speaker', detail: 'Delivered corporate communication and growth mindset sessions for leadership teams.', icon: Mic },
  { org: 'The Denim Company', role: 'Corporate Communication Consultant', detail: 'Facilitated public speaking, executive presence, and leadership communication workshops.', icon: Building2 },
];

const pillars = [
  { icon: BookOpen, title: 'Knowledge', desc: 'Mastery of English grammar, phonetics, vocabulary, and structural language rules — the academic foundation.', color: 'blue' },
  { icon: MessageSquare, title: 'Practice', desc: 'Real-world scenarios, simulations, interactive discussions, and active writing tasks to build fluency.', color: 'indigo' },
  { icon: Brain, title: 'Confidence', desc: 'Mindset conditioning to eliminate hesitation, overcome fear, and speak naturally in every situation.', color: 'violet' },
];

const features = [
  { icon: GraduationCap, label: 'IELTS Academic & General Training', sub: 'Listening · Reading · Writing · Speaking' },
  { icon: Mic, label: 'Spoken English & Fluency Development', sub: 'Accent reduction & natural communication' },
  { icon: Globe, label: 'Pronunciation & Phonetics Mastery', sub: 'IPA, stress patterns & clarity drills' },
  { icon: Star, label: 'Public Speaking & Personality Development', sub: 'Presentations, stage presence & leadership' },
  { icon: Briefcase, label: 'Corporate & Workplace Communication', sub: 'Emails, interviews & executive skills' },
  { icon: HeartPulse, label: 'Medical & Healthcare English', sub: 'Terminology, global nursing & IELTS-H' },
];

const stats = [
  { value: '8+', label: 'Years Professional Experience', icon: TrendingUp, color: 'blue' },
  { value: '1,500+', label: 'IELTS Students Guided', icon: Users, color: 'indigo' },
  { value: '100%', label: 'Practical & Result-Oriented', icon: Award, color: 'violet' },
  { value: 'Hybrid', label: 'Online & Physical Batches', icon: Laptop, color: 'emerald' },
];

const cm = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export default function About() {
  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen">

      {/* HERO */}
      <section className="relative min-h-[82vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950" />
        </div>
        <div className="absolute top-24 left-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-16 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="relative z-10 section-container py-28 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-8">
            <BookOpen className="w-4 h-4" /> English With MHS — Official Academy
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight mb-6">
            Transforming Communication<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">into Opportunity</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Welcome to <strong className="text-white">English With MHS</strong> — founded by M. Huzaifa Siddiqui. Practical, result-driven English and IELTS training designed for academic, professional, and corporate success.
          </p>
          <Link to="/courses" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105">
            Explore Courses <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="py-14 border-y border-slate-800/60 bg-slate-900/50">
        <div className="section-container grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon, color }) => {
            const c = cm[color];
            return (
              <div key={label} className={`flex flex-col items-center text-center p-6 rounded-2xl border ${c.border} ${c.bg}`}>
                <Icon className={`w-7 h-7 ${c.text} mb-3`} />
                <div className={`text-4xl font-extrabold font-display ${c.text} mb-1`}>{value}</div>
                <div className="text-sm text-slate-400 font-medium leading-tight">{label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOUNDER SPOTLIGHT */}
      <section className="py-24 section-container">
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold uppercase tracking-widest text-sm mb-3">Meet Your Trainer</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">Sir M. Huzaifa Siddiqui</h2>
        </div>
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 flex flex-col items-center lg:items-start gap-5">
            <div className="relative w-full max-w-xs mx-auto lg:mx-0">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 blur opacity-40" />
              <img src="/trainer.jpg" alt="Sir M. Huzaifa Siddiqui" className="relative w-full rounded-3xl object-cover shadow-2xl" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {['English Language Trainer', 'IELTS Specialist', 'Public Speaker', 'Communication Coach'].map(b => (
                <span key={b} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-full">{b}</span>
              ))}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed text-center lg:text-left">
              8+ years of experience training <strong className="text-white">1,500+ students</strong> and corporate teams across Karachi and globally — with a passionate focus on practical, confidence-building English.
            </p>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-bold text-white mb-6">Professional Career Journey</h3>
            {timeline.map((item) => {
              const Icon = item.icon;
              const c = cm[item.color];
              return (
                <div key={item.org} className={`flex gap-4 p-5 rounded-2xl border ${c.border} ${c.bg} hover:scale-[1.01] transition-transform`}>
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${c.border} ${c.bg}`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${c.text}`}>{item.org}</p>
                    <p className="font-semibold text-white text-sm mt-0.5">{item.role}</p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-4">Corporate Workshops & Guest Speaking</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {corporate.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.org} className="p-5 rounded-2xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                      <Icon className="w-5 h-5 text-amber-400 mb-3" />
                      <p className="font-bold text-white text-sm">{item.org}</p>
                      <p className="text-amber-400 text-xs font-semibold mt-0.5">{item.role}</p>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="py-24 bg-slate-900/60 border-y border-slate-800/60">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold uppercase tracking-widest text-sm mb-3">Core Teaching Methodology</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white">The 3-Pillar Framework</h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-4">Every lesson, every session, every course is built on three non-negotiable principles.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc, color }, i) => {
              const c = cm[color];
              return (
                <div key={title} className={`relative p-8 rounded-3xl border ${c.border} bg-slate-900 hover:scale-[1.02] transition-all group overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${c.bg} rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform`} />
                  <div className={`relative w-14 h-14 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${c.text}`} />
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-widest ${c.text} mb-2`}>Pillar {i + 1}</div>
                  <h3 className="text-2xl font-display font-bold text-white mb-3">{title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 section-container">
        <div className="text-center mb-14">
          <p className="text-blue-400 font-semibold uppercase tracking-widest text-sm mb-3">Comprehensive Training Areas</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">What We Help You With</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-tight">{label}</p>
                <p className="text-slate-500 text-xs mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-t border-slate-800/60">
        <div className="section-container text-center max-w-3xl mx-auto">
          <Quote className="w-10 h-10 text-blue-500/40 mx-auto mb-4" />
          <blockquote className="text-2xl md:text-3xl font-display font-bold text-white leading-snug mb-4">
            "Learn English. Build Confidence. Communicate Better."
          </blockquote>
          <cite className="block text-blue-400 font-semibold not-italic mb-10">— M. Huzaifa Siddiqui</cite>
          <p className="text-slate-300 text-lg leading-relaxed mb-12">
            Our mission is to move learners <strong className="text-white">beyond simply knowing English</strong> — to actually <span className="text-blue-400 font-semibold">using English</span> with absolute confidence in every academic, professional, and social setting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105">
              <GraduationCap className="w-5 h-5" /> Join a Batch Today
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl transition-all hover:scale-105 backdrop-blur-sm">
              <MessageSquare className="w-5 h-5" /> Contact Support
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

