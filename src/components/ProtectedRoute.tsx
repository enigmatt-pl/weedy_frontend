import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  requiredRole?: 'user' | 'super_admin';
  requireApproved?: boolean;
}

export const ProtectedRoute = ({ 
  requiredRole = 'user', 
  requireApproved = true 
}: ProtectedRouteProps) => {
  const { token, role, approved, loading } = useAuthStore();

  if (loading) return null;

  if (!token) return <Navigate to="/login" replace />;

  if (requireApproved && !approved && role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-lg text-center border-l-8 border-emerald-500 animate-in fade-in zoom-in-95 duration-500">
          <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter mb-4 italic uppercase">Brak autoryzacji</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs leading-relaxed mb-8">
            Terminal nie został jeszcze zatwierdzony przez administratora floty. Twoje dane oczekują na weryfikację.
          </p>
          <div className="flex items-center justify-center gap-4 bg-emerald-50 p-6 rounded-xl border border-orange-100">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Procedura Oczekiwania Systemowej (BETA)</span>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole === 'super_admin' && role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
