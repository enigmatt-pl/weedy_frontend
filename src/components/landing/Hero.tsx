import { Link } from 'react-router-dom';
import { Zap, Smartphone, ChevronRight } from 'lucide-react';

export const Hero = ({ user }: { user: { first_name?: string } | null }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-white py-16 md:py-32 px-6 sm:px-10 scroll-mt-20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 md:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-8 md:mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-primary" />
            WEEDY NETWORK — POLSKA
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-brand-dark mb-6 md:mb-10 tracking-tight leading-[1.1] md:leading-[1.05]">
            Znajdź Swoje <br />
            <span className="text-primary">Dispensary</span> <br />
            w Twojej okolicy.
          </h1>
          <p className="text-base md:text-xl text-slate-600 mb-8 md:mb-12 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
            Najbardziej zaawansowana wyszukiwarka punktów w Polsce. Sprawdzaj dostępność, czytaj opinie i korzystaj z analityki opartej na Big Data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
            <Link
              to="/dashboard"
              className="px-8 md:px-12 py-4 md:py-5 bg-primary text-white text-[13px] md:text-[14px] font-semibold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:scale-105 hover:bg-emerald-600 active:scale-95 transition-all text-center flex items-center justify-center gap-3"
            >
              Uruchom Mapę <ChevronRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-4 px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-2xl justify-center">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] md:text-[11px] font-bold text-slate-900 uppercase tracking-widest leading-none">Dostępne Mobilnie</span>
                <span className="text-[8px] md:text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-1">Zawsze pod ręką</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block flex-shrink-0 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-96 h-96 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative w-full h-full bg-white rounded-[3rem] border border-slate-100 shadow-2xl transition-transform duration-700 overflow-hidden flex flex-col p-8 backdrop-blur-3xl">
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-slate-100" />
                <div className="w-3 h-3 rounded-full bg-slate-100" />
                <div className="w-3 h-3 rounded-full bg-slate-100" />
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-50 rounded-full w-full" />
                <div className="h-4 bg-slate-50 rounded-full w-3/4" />
                <div className="h-24 bg-emerald-50 rounded-3xl w-full flex items-center justify-center border border-emerald-100 animate-pulse">
                  <Zap className="w-10 h-10 text-primary opacity-20" />
                </div>
                <div className="h-4 bg-slate-50 rounded-full w-full" />
                <div className="h-4 bg-slate-50 rounded-full w-1/2" />
              </div>
              <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>WYSZUKIWANIE...</span>
                <span className="text-primary">LIVE DATA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
