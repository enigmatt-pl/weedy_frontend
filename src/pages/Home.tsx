import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, Menu as MenuIcon, X } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

// Landing Components
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ROI } from '../components/landing/ROI';
import { Pricing } from '../components/landing/Pricing';
import { Security } from '../components/landing/Security';
import { Footer } from '../components/landing/Footer';

const NAV_LINKS = [
  { label: 'Funkcje', href: '#features' },
  { label: 'Jak działamy', href: '#how-it-works' },
  { label: 'ROI', href: '#roi' },
  { label: 'Cennik', href: '#pricing' },
  { label: 'Bezpieczeństwo', href: '#security' },
];

export const Home = () => {
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
          <Logo size="md" />
          <div className="hidden lg:flex items-center ml-12 gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          {user ? (
            <div className="flex items-center gap-4 md:gap-8">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-all group"
              >
                <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Panel Operacyjny</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-600 transition-all border-l border-slate-200 pl-4 md:pl-6 group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Wyloguj</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-8">
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-all"
              >
                Zaloguj
              </Link>
              <Link
                to="/register"
                className="px-4 md:px-6 py-2 md:py-3 bg-brand-dark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all ring-4 ring-brand-dark/10"
              >
                Start
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top duration-300 z-40">
            <div className="flex flex-col p-6 gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-primary py-3 border-b border-slate-50 last:border-0"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero user={user} />
        <Features />
        <HowItWorks />
        <ROI />
        <Pricing />
        <Security />
      </main>

      <Footer />
    </div>
  );
};
