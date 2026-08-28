import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role !== 'admin' && user.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === 'student' && user.role !== 'student') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
