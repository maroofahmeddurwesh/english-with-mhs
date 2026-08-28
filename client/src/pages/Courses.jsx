import { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, UploadCloud, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Booking Form State
  const [formData, setFormData] = useState({
    student_name: '', student_email: '', student_phone: '',
    slot_id: '', transaction_id: '', payment_method: 'NayaPay'
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/courses'),
      api.get('/courses/payment-methods') // Public endpoint we added in routes
    ]).then(([coursesRes, pmRes]) => {
      setCourses(coursesRes.data.data.courses);
      setPaymentMethods(pmRes.data.data.payment_methods);
    }).catch(err => {
      console.error(err);
      toast.error('Failed to load courses.');
    }).finally(() => setLoading(false));
  }, []);

  const openBookingModal = async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setSelectedCourse(res.data.data.course);
      
      // Filter active slots that have space
      const slots = res.data.data.slots.filter(s => s.booked_count < s.max_capacity);
      setAvailableSlots(slots);
      
      setFormData({
        student_name: '', student_email: '', student_phone: '',
        slot_id: '', transaction_id: '', payment_method: paymentMethods[0]?.name || 'NayaPay'
      });
      setReceiptFile(null);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load course details.');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) return toast.error('Please upload your payment receipt.');
    if (!formData.slot_id) return toast.error('Please select a batch slot.');

    setSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('course_id', selectedCourse.id);
    data.append('receipt', receiptFile);

    try {
      const res = await api.post('/bookings/submit', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message, { duration: 5000 });
      setIsModalOpen(false);
      // Optional: Refresh slots or just show success
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;

  const activePaymentMethod = paymentMethods.find(m => m.name === formData.payment_method);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-20 border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          <img src="/courses-hero.jpg" alt="English Courses" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        
        <div className="section-container relative z-10 text-center animate-fadeUp">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Courses</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the right course for your goals and start your journey to fluency with our expert-led modules.
          </p>
        </div>
      </section>

      <div className="section-container py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30">
              <div className="h-48 bg-slate-950 relative p-6 flex flex-col justify-end overflow-hidden border-b border-slate-800">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-slate-800">
                  {course.level}
                </div>
                <h3 className="text-2xl font-display font-bold text-white relative z-10 group-hover:text-blue-400 transition-colors">{course.title}</h3>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">{course.description}</p>
                
                <div className="space-y-3 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Clock className="w-4 h-4 text-blue-500" /> Duration: <span className="font-medium text-white">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Calendar className="w-4 h-4 text-emerald-500" /> Available Slots: <span className="font-medium text-white">{course.available_slots_count}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800 mb-6">
                  <div>
                    <span className="text-slate-500 font-medium text-sm">Monthly Fee</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">Rs. {Number(course.fee).toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => openBookingModal(course.id)}
                  className="btn-primary w-full shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20 py-3"
                  disabled={course.available_slots_count === 0}
                >
                  {course.available_slots_count > 0 ? 'Enroll Now' : 'Batches Full'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl my-8 relative flex flex-col animate-scaleIn max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">Enroll: {selectedCourse.title}</h2>
                <p className="text-slate-500 font-medium">Monthly Fee: <span className="text-blue-600 font-bold">Rs. {Number(selectedCourse.fee).toLocaleString()}</span><span className="text-slate-400 text-sm"> / month</span></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-8">
                
                {/* Step 1: Student Details */}
                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center text-sm">1</span> Student Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name</label>
                      <input required type="text" className="form-input" value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} placeholder="e.g. Ali Ahmed" />
                    </div>
                    <div>
                      <label className="form-label">Email Address (For Zoom Link)</label>
                      <input required type="email" className="form-input" value={formData.student_email} onChange={e => setFormData({...formData, student_email: e.target.value})} placeholder="ali@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">WhatsApp Number</label>
                      <input required type="text" className="form-input" value={formData.student_phone} onChange={e => setFormData({...formData, student_phone: e.target.value})} placeholder="0300-0000000" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Select Slot */}
                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center text-sm">2</span> Select Batch Timings</h3>
                  {availableSlots.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
                      No slots available currently.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {availableSlots.map(slot => (
                        <label key={slot.id} className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.slot_id === String(slot.id) ? 'border-blue-500 bg-blue-900/20' : 'border-slate-800 hover:border-blue-500/50'}`}>
                          <input type="radio" name="slot" value={slot.id} className="sr-only" onChange={e => setFormData({...formData, slot_id: e.target.value})} />
                          <div className="font-semibold text-white mb-1">{slot.days_of_week}</div>
                          <div className="text-sm text-slate-400">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</div>
                          {slot.batch_start_date && (
                            <div className="text-xs font-medium text-emerald-600 mt-2 bg-emerald-100 inline-block px-2 py-0.5 rounded">Starts: {new Date(slot.batch_start_date).toLocaleDateString()}</div>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 3: Payment */}
                <div>
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-900/40 text-blue-400 flex items-center justify-center text-sm">3</span> Payment & Verification</h3>
                  
                  <div className="mb-4">
                    <label className="form-label">Payment Method</label>
                    <select className="form-input" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                      {paymentMethods.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {activePaymentMethod && (
                    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-xl mb-6 space-y-2">
                      <p className="text-sm text-slate-400"><span className="font-semibold text-white">Account Title:</span> {activePaymentMethod.account_title}</p>
                      <p className="text-sm text-slate-400"><span className="font-semibold text-white">Account Number:</span> <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded border border-slate-800 text-blue-600">{activePaymentMethod.account_number}</span></p>
                      {activePaymentMethod.iban && (
                        <p className="text-sm text-slate-400"><span className="font-semibold text-white">IBAN:</span> <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded border border-slate-800">{activePaymentMethod.iban}</span></p>
                      )}
                      <div className="mt-3 text-sm text-emerald-400 bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/30">
                        {activePaymentMethod.instructions}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Transaction ID (TID)</label>
                      <input required type="text" className="form-input" value={formData.transaction_id} onChange={e => setFormData({...formData, transaction_id: e.target.value})} placeholder="Enter TID from receipt" />
                    </div>
                    <div>
                      <label className="form-label">Upload Receipt Screenshot</label>
                      <div className="relative">
                        <input required type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => setReceiptFile(e.target.files[0])} />
                        <div className={`form-input flex items-center gap-2 ${receiptFile ? 'border-emerald-500 bg-emerald-900/20 text-emerald-400' : 'text-slate-500 border-dashed border-2 hover:bg-slate-900/50'}`}>
                          <UploadCloud className="w-5 h-5 shrink-0" />
                          <span className="truncate">{receiptFile ? receiptFile.name : 'Choose image file...'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP (Max 5MB)</p>
                    </div>
                  </div>

                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" form="booking-form" disabled={submitting || availableSlots.length === 0} className="btn-primary w-full sm:w-auto">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Booking'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
