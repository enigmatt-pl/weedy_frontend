import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Star, Package, Loader2, SlidersHorizontal, X, Leaf, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { DispensariesApi, Dispensary } from '../lib/api';
import { Map } from '../components/Map';

const POLISH_CITIES = ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Łódź', 'Katowice', 'Lublin', 'Białystok', 'Rzeszów', 'Szczecin', 'Bydgoszcz'];

const CATEGORIES = [
  { id: 'all', label: 'Wszystko' },
  { id: 'cbd', label: 'CBD' },
  { id: 'hemp', label: 'Konopie' },
  { id: 'medical', label: 'Medyczna' },
  { id: 'accessories', label: 'Akcesoria' },
];

const stripMarkdown = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
};

export const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDispensaries = async () => {
      setLoading(true);
      try {
        const data = await DispensariesApi.getAll(page, 12);
        const published = data.dispensaries.filter(d => d.status === 'published' || d.status === 'draft');
        setDispensaries(published);
        setTotalPages(data.meta.total_pages);
        setTotalCount(data.meta.total_count);
      } catch {
        setDispensaries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDispensaries();
  }, [page]);

  const filtered = dispensaries.filter(d => {
    const haystack = `${d.title} ${d.description} ${d.query_data}`.toLowerCase();
    const qMatch = !query || haystack.includes(query.toLowerCase());
    const cityMatch = !selectedCity || haystack.includes(selectedCity.toLowerCase());
    return qMatch && cityMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-brand-dark font-bold text-lg tracking-tight shrink-0"
          >
            <Leaf className="w-6 h-6 text-primary" />
            <span className="hidden sm:inline">Weedy</span>
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Szukaj dispensary, CBD, konopi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtry</span>
          </button>

          <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block" />

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        {showFilters && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 flex flex-wrap gap-3 animate-in slide-in-from-top-2 duration-200">
            {/* City pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Miasto:</span>
              {POLISH_CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCity === city ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-primary'}`}
                >
                  {city}
                </button>
              ))}
            </div>
            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Kategoria:</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCategory === cat.id ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-primary'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10">
        {/* Results header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              {selectedCity ? `Dispensary w mieście ${selectedCity}` : 'Wszystkie Dispensary w Polsce'}
            </h1>
            {!loading && (
              <p className="text-sm text-slate-500 font-medium mt-1">
                Znaleziono <span className="text-primary font-bold">{filtered.length}</span> punktów
                {totalCount > filtered.length && ` (łącznie ${totalCount} w bazie)`}
              </p>
            )}
          </div>
          {(query || selectedCity) && (
            <button
              onClick={() => { setQuery(''); setSelectedCity(''); }}
              className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Wyczyść filtry
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className={`flex flex-col lg:flex-row gap-10 ${viewMode === 'map' ? 'h-[calc(100vh-200px)]' : ''}`}>
          {/* Results Side */}
          <div className={`flex-1 ${viewMode === 'map' ? 'lg:max-w-[500px] xl:max-w-[600px] overflow-y-auto pr-4 custom-scrollbar' : ''}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Wyszukiwanie punktów...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-slate-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-brand-dark mb-2">Brak wyników</h2>
                  <p className="text-slate-500 font-medium max-w-sm">
                    Nie znaleźliśmy punktów pasujących do Twoich kryteriów. Spróbuj zmienić wyszukiwaną frazę lub filtry.
                  </p>
                </div>
                <button
                  onClick={() => { setQuery(''); setSelectedCity(''); setSelectedCategory('all'); }}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all"
                >
                  Pokaż wszystkie punkty
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {filtered.map((dispensary) => {
                  const images = dispensary.image_urls || dispensary.images || [];
                  const isHovered = hoveredId === dispensary.id;
                  const isSelected = selectedId === dispensary.id;
                  
                  return (
                    <div
                      key={dispensary.id}
                      id={`dispensary-${dispensary.id}`}
                      onMouseEnter={() => setHoveredId(dispensary.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(dispensary.id)}
                      className={`bg-white rounded-3xl border shadow-lg shadow-slate-200/50 overflow-hidden group cursor-pointer transition-all duration-500
                        ${isSelected ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}
                        ${viewMode === 'grid' ? 'hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1' : 'flex items-center p-4 gap-4 hover:bg-emerald-50/50'}
                      `}
                    >
                      <div className={`bg-gradient-to-br from-emerald-50 to-slate-100 overflow-hidden relative shrink-0
                        ${viewMode === 'grid' ? 'aspect-[4/3]' : 'w-24 h-24 rounded-2xl'}
                      `}>
                        {images.length > 0 ? (
                          <img
                            src={images[0]}
                            alt={dispensary.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            <Leaf className="w-8 h-8 text-emerald-200" />
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 ${viewMode === 'grid' ? 'p-5' : 'py-1'}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className={`font-bold text-brand-dark leading-tight group-hover:text-primary transition-colors line-clamp-1 ${viewMode === 'grid' ? 'text-base' : 'text-sm'}`}>
                            {dispensary.title}
                          </h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-bold text-slate-700">4.{(dispensary.id % 4) + 5}</span>
                          </div>
                        </div>

                        {dispensary.query_data && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <p className="text-[10px] font-medium text-slate-500 truncate">
                              {dispensary.query_data.replace(/\n/g, ' ')}
                            </p>
                          </div>
                        )}

                        {viewMode === 'grid' && (
                          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                            {stripMarkdown(dispensary.description) || 'Profesjonalny punkt dystrybucji produktów konopnych.'}
                          </p>
                        )}

                        <div className={`flex items-center justify-between pt-3 border-t border-slate-50 ${viewMode === 'grid' ? '' : 'hidden'}`}>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium">Pon-Sob 9–21</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                            <Package className="w-3 h-3" />
                            <span>CBD · Hemp</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map Side */}
          {(viewMode === 'map' || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <div className={`lg:flex-1 lg:sticky lg:top-24 h-[500px] lg:h-[calc(100vh-160px)] transition-all duration-500
              ${viewMode === 'map' ? 'block' : 'hidden lg:block'}
            `}>
              <Map 
                dispensaries={filtered} 
                onSelect={(id) => {
                  setSelectedId(id);
                  const el = document.getElementById(`dispensary-${id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                selectedId={selectedId}
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Poprzednia
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${p === page ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Następna →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
