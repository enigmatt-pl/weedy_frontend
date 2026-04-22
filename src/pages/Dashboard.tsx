import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Plus, History, LogOut, User, Settings as SettingsIcon, Menu, X, Users, TrendingUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export const Dashboard = () => {
  const { user, role, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded transition-all uppercase tracking-widest text-[10px] font-black ${isActive
      ? 'bg-primary text-white shadow-lg'
      : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen bg-slate-50 flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden bg-brand-dark px-6 py-4 flex items-center justify-between border-b border-slate-800 z-30 sticky top-0">
        <Logo variant="light" size="sm" />
        <button
          id="dashboard-mobile-menu-btn"
          onClick={toggleSidebar}
          className="p-2 text-white hover:text-primary transition-colors focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 h-full bg-brand-dark flex flex-col shadow-2xl z-50 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="hidden lg:flex px-6 py-8 border-b border-slate-800/50 justify-start items-center bg-slate-900/10 mb-6">
          <Logo variant="light" size="sm" />
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 lg:mt-0">
          <NavLink id="nav-new-dispensary" to="/dashboard/new" className={navLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Plus className="w-4 h-4" />
            <span>Dodaj Punkt</span>
          </NavLink>

          <NavLink id="nav-history" to="/dashboard/history" className={navLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <History className="w-4 h-4" />
            <span>Moje Punkty</span>
          </NavLink>

          <NavLink id="nav-settings" to="/dashboard/settings" className={navLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <SettingsIcon className="w-4 h-4" />
            <span>Ustawienia</span>
          </NavLink>
          
          {role === 'super_admin' && (
            <div className="pt-6 mt-6 border-t border-slate-800/50 space-y-2">
                <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Administracja</p>
                <NavLink id="nav-admin-users" to="/admin/users" className={navLinkClass} onClick={() => setIsSidebarOpen(false)}>
                  <Users className="w-4 h-4" />
                  <span>Użytkownicy</span>
                </NavLink>
                <NavLink id="nav-admin-analytics" to="/admin/analytics" className={navLinkClass} onClick={() => setIsSidebarOpen(false)}>
                  <TrendingUp className="w-4 h-4" />
                  <span>Statystyki Sieci</span>
                </NavLink>
              </div>
          )}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="min-w-10 min-h-10 w-10 h-10 bg-slate-800 border-2 border-primary/20 rounded-full flex items-center justify-center overflow-hidden shadow-inner ring-2 ring-slate-800">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white uppercase tracking-tight truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{role === 'super_admin' ? 'Super Admin' : 'Operator'}</p>
            </div>
          </div>
          <Button
            id="dashboard-signout-btn"
            variant="ghost"
            fullWidth
            onClick={handleSignOut}
            className="justify-start gap-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 text-[10px] items-center"
          >
            <LogOut className="w-4 h-4" />
            Wyloguj
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 w-full relative">
        <div className="max-w-6xl mx-auto p-6 md:p-12 transition-all">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
