import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Search, MapPin, Clock, Star, Package, Loader2, SlidersHorizontal, X, Leaf, LayoutGrid, Map as MapIcon, Edit2, Trash2 } from 'lucide-react';
import { Dispensary, SearchApi, SearchParams } from '../lib/api';
import { useAuthStore } from '../store/authStore';
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
  const { searchId } = useParams<{ searchId: string }>();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'grid';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(initialCategory !== 'all' || initialQuery !== '' || initialCity !== '');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>(initialView);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchDispensaries = async () => {
      setLoading(true);
      try {
        if (searchId) {
          // Persisted search — re-run by UUID (bookmarkable / shareable)
          const data = await SearchApi.get(searchId, page);
          setDispensaries(data.results);
          setQuery(data.query || '');
          setSelectedCity(data.city || '');
          setSelectedCategory(data.category || 'all');
          setTotalPages(data.meta.total_pages);
          setTotalCount(data.meta.total_count);
        } else {
          // No UUID yet — build params from URL then create a persisted search record.
          // POST /searches is the single source of truth for public results (no auth required).
          const params: SearchParams = {};
          if (initialQuery) params.q = initialQuery;
          if (initialCity) params.city = initialCity;
          if (initialCategory !== 'all') params.category = initialCategory;

          const data = await SearchApi.create(params);
          setDispensaries(data.results);
          setTotalPages(data.meta.total_pages);
          setTotalCount(data.meta.total_count);

          // If URL had filter params, promote to a persisted URL so it's bookmarkable
          if (initialQuery || initialCity || initialCategory !== 'all') {
            navigate(`/searches/${data.search_id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to fetch dispensaries:', err);
        setDispensaries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDispensaries();
    // initialQuery/City/Category are stable URL-derived values; searchId and page drive re-fetches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchId]);

  const handleFilterChange = async (newParams: Partial<SearchParams>) => {
    try {
      const combinedParams: SearchParams = {
        q: query || undefined,
        city: selectedCity || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        ...newParams,
      };
      const { search_id } = await SearchApi.create(combinedParams);
      navigate(`/searches/${search_id}`);
    } catch (error) {
      console.error('Failed to create search record:', error);
    }
  };

  // Debounced text search — prevents double-submit on rapid Enter presses
  const handleTextSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleFilterChange({ q: query || undefined });
    }, 300);
  };

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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextSearch();
                }
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {query && (
              <button onClick={() => { setQuery(''); handleFilterChange({ q: undefined }); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
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
                  onClick={() => handleFilterChange({ city: selectedCity === city ? undefined : city })}
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
                  onClick={() => handleFilterChange({ category: cat.id === 'all' ? undefined : cat.id })}
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
                Znaleziono <span className="text-primary font-bold">{totalCount}</span> punktów
              </p>
            )}
          </div>
          {(query || selectedCity || selectedCategory !== 'all') && (
            <button
              onClick={() => { 
                setQuery(''); 
                setSelectedCity(''); 
                setSelectedCategory('all'); 
                setFocusedId(null); 
                setSelectedId(null); 
                navigate('/search');
              }}
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
            ) : dispensaries.length === 0 ? (
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
                  onClick={() => { 
                    setQuery(''); 
                    setSelectedCity(''); 
                    setSelectedCategory('all'); 
                    setFocusedId(null); 
                    setSelectedId(null); 
                    navigate('/search');
                  }}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all"
                >
                  Pokaż wszystkie punkty
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {dispensaries.map((dispensary) => {
                  const images = dispensary.image_urls || dispensary.images || [];
                  const isHovered = hoveredId === dispensary.id;
                  const isSelected = selectedId === dispensary.id;
                  
                  return (
                    <div
                      key={dispensary.id}
                      id={`dispensary-${dispensary.id}`}
                      onMouseEnter={() => setHoveredId(dispensary.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        setFocusedId(dispensary.id);
                        if (viewMode === 'map') {
                          // Already showing map, just let it focus
                        } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          // On mobile, maybe switch to map? 
                          // Or just open drawer directly for mobile?
                          // Let's stick to user request: focus map.
                          setViewMode('map');
                        }
                      }}
                      className={`bg-white rounded-3xl border shadow-lg shadow-slate-200/50 overflow-hidden group cursor-pointer transition-all duration-500
                        ${(selectedId === dispensary.id || focusedId === dispensary.id) ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}
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
                            <span className="text-[10px] font-bold text-slate-700">{dispensary.rating || 'N/A'}</span>
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
                            <span className="text-[10px] font-medium">{dispensary.hours || 'Godziny niepodane'}</span>
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
                dispensaries={dispensaries} 
                onSelect={(id) => {
                  setFocusedId(id);
                  setSelectedId(id);
                }}
                focusedId={focusedId}
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
      {/* Quick Detail Drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedId(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-500">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-brand-dark leading-tight">Szczegóły Punktu</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Informacje zweryfikowane</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedId(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {(() => {
                const d = dispensaries.find(item => item.id === selectedId);
                if (!d) return null;
                const images = d.image_urls || d.images || [];

                return (
                  <div className="space-y-10">
                    {/* Image Gallery */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {images.slice(0, 4).map((url, i) => (
                          <div key={i} className={`rounded-3xl overflow-hidden border border-slate-100 shadow-sm ${i === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                            <img src={url} className="w-full h-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-6">
                      <h1 className="text-3xl font-black text-brand-dark tracking-tight leading-none">{d.title}</h1>
                      <div className="flex flex-wrap gap-2">
                        {d.categories?.map(cat => (
                          <span key={cat} className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {cat}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 stroke-amber-500" /> {d.rating || '4.8'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <h3 className="text-xs font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Lokalizacja
                      </h3>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        {d.city}, {d.query_data?.replace(/\n/g, ', ')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</h3>
                        <p className="text-sm font-bold text-brand-dark">{d.phone || 'Nie podano'}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Godziny</h3>
                        <p className="text-sm font-bold text-brand-dark">{d.hours || '09:00 - 21:00'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-brand-dark uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" /> O firmie
                      </h3>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {stripMarkdown(d.description)}
                      </p>
                    </div>

                    {d.website && (
                      <a 
                        href={d.website.startsWith('http') ? d.website : `https://${d.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest text-center block hover:bg-black transition-colors shadow-2xl shadow-black/20"
                      >
                        Odwiedź stronę WWW
                      </a>
                    )}

                    {user && user.id === d.user_id && (
                      <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                        <button 
                          onClick={() => navigate('/dashboard/history')}
                          className="py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" /> Edytuj Punkt
                        </button>
                        <button 
                          onClick={() => navigate('/dashboard/history')}
                          className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Usuń
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
