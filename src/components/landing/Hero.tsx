import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Leaf, Sparkles, Store, Package, Zap } from 'lucide-react';
import { useState } from 'react';
import { SearchApi } from '../../lib/api';

export const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const categories = [
    { id: 'cbd', label: 'CBD', icon: Leaf },
    { id: 'hemp', label: 'Konopie', icon: Sparkles },
    { id: 'medical', label: 'Medyczna', icon: Store },
    { id: 'accessories', label: 'Akcesoria', icon: Package },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await SearchApi.create({ q: query });
      navigate(`/searches/${response.search_id}`);
    } catch (error) {
      console.error('Search record creation failed:', error);
    }
  };

  const handleCategorySearch = async (categoryId: string) => {
    try {
      const { search_id } = await SearchApi.create({ category: categoryId });
      navigate(`/searches/${search_id}`);
    } catch (error) {
      console.error('Category search failed:', error);
      navigate(`/search?category=${categoryId}`);
    }
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 py-20 md:py-32 px-6 sm:px-10">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 w-full text-center">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-emerald-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          The Ultimate Weed Search Portal
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white mb-10 tracking-tight leading-[0.95] md:leading-[0.9]">
          Znajdź Swoje <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Dispensary.</span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-400 mb-16 max-w-2xl font-medium leading-relaxed mx-auto">
          Odkryj najlepsze punkty w Twojej okolicy. Sprawdzaj dostępność, <br className="hidden md:block" /> czytaj opinie i korzystaj z interaktywnej mapy.
        </p>

        {/* Search Portal Bar */}
        <div className="max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <form 
            onSubmit={handleSearch}
            className="group relative flex items-center p-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl focus-within:bg-white focus-within:ring-8 focus-within:ring-emerald-500/20 transition-all duration-500"
          >
            <div className="pl-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wpisz miasto lub nazwę punktu..."
              className="flex-1 bg-transparent border-none px-6 py-5 text-lg md:text-xl font-bold text-white group-focus-within:text-slate-900 outline-none placeholder:text-slate-500"
            />
            <button 
              type="submit"
              className="px-8 md:px-12 py-5 bg-primary text-white text-sm md:text-base font-black uppercase tracking-widest rounded-[2rem] hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-500/30"
            >
              Szukaj
            </button>
          </form>
        </div>

        {/* Quick Categories */}
        <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySearch(cat.id)}
              className="group flex items-center gap-3 px-6 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-slate-300 hover:bg-white hover:text-slate-900 hover:border-white hover:-translate-y-1 transition-all duration-300"
            >
              <cat.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Floating Badges */}
        <div className="mt-20 flex flex-wrap justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Map Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Verified Listings</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Instant Search</span>
          </div>
        </div>
      </div>
    </section>
  );
};
