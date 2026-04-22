import { Link } from 'react-router-dom';
import { Zap, Smartphone, ChevronRight } from 'lucide-react';

export const Hero = ({ user }: { user: { first_name?: string } | null }) => {
  return (
    <section id="hero" className="relative overflow-hidden bg-brand-dark py-16 md:py-32 px-6 sm:px-10 border-b-[12px] border-primary scroll-mt-20">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 md:gap-20">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded bg-primary/10 border border-primary/30 text-primary text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-8 md:mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <Zap className="w-3 h-3 md:w-4 md:h-4 fill-primary" />
            WEEDY NETWORK — POLSKA
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 md:mb-10 tracking-tighter leading-[0.9] md:leading-[0.85] uppercase italic transform lg:-skew-x-2">
            Znajdź Swoje <br />
            <span className="text-primary not-italic inline-block bg-white/5 px-4 transform lg:skew-x-2 ring-4 ring-primary/20">Dispensary</span> <br />
            w Twojej okolicy.
          </h1>
          <p className="text-base md:text-xl text-emerald-100/60 mb-8 md:mb-12 max-w-2xl font-black leading-relaxed italic border-l-4 border-white/20 pl-6 md:pl-8 mx-auto lg:mx-0">
            Najbardziej zaawansowana wyszukiwarka punktów w Polsce. Sprawdzaj dostępność, czytaj opinie i korzystaj z analityki opartej na Big Data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
            <Link
              to="/dashboard"
              className="px-6 md:px-10 py-4 md:py-5 bg-primary text-white text-[11px] md:text-[12px] font-black uppercase tracking-[0.3em] rounded shadow-2xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-3 ring-4 ring-primary/20"
            >
              Uruchom Mapę <ChevronRight className="w-4 h-4" />
            </Link>
            
            <div className="flex items-center gap-4 px-6 py-4 md:py-5 bg-white/5 border border-white/10 rounded backdrop-blur-sm justify-center">
              <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest leading-none">Dostępne Mobilnie</span>
                <span className="text-[7px] md:text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Zawsze pod ręką</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block flex-shrink-0 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-96 h-96 relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative w-full h-full bg-slate-800 rounded-3xl border border-white/10 shadow-3xl transform rotate-6 hover:rotate-0 transition-transform duration-700 overflow-hidden flex flex-col p-8 backdrop-blur-3xl border-r-[12px] border-b-[12px] border-primary/40">
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-24 bg-primary/20 rounded-xl w-full flex items-center justify-center border-2 border-primary/30 border-dashed animate-pulse">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <div className="h-4 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
              <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                <span>SKANOWANIE SIECI...</span>
                <span className="text-primary">LIVE DATA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
