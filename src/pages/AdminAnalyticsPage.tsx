import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AdminApi } from '../lib/api';
import { Loader2, Globe, Monitor, Smartphone, Clock, TrendingUp, Eye, ChevronLeft, ChevronRight, Hash, Database, Cpu, Battery, HardDrive, Sun, Moon, X, Info, Layers, Activity, MousePointer2, Search, Filter, MapPin, Languages, Radio } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../store/toastStore';

interface PageView {
  id: number;
  visitor_id: string;
  path: string;
  referrer: string;
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  language: string;
  languages: string;
  timezone: string;
  timezone_offset_minutes: number;
  screen_width: number;
  screen_height: number;
  screen_color_depth: number;
  screen_orientation: string;
  device_pixel_ratio: number;
  viewport_width: number;
  viewport_height: number;
  ip_address?: string;
  country?: string; 
  country_code?: string;
  city?: string;
  isp?: string;
  created_at: string;
  hardware_concurrency?: number;
  device_memory_gb?: number;
  max_touch_points?: number;
  gpu_vendor?: string;
  gpu_renderer?: string;
  cpu_architecture?: string;
  device_model?: string;
  platform?: string;
  vendor?: string;
  connection_type?: string;
  connection_effective_type?: string;
  connection_downlink_mbps?: number;
  connection_rtt_ms?: number;
  battery_level?: number;
  battery_charging?: boolean;
  storage_quota_mb?: number;
  storage_usage_mb?: number;
  color_scheme?: 'light' | 'dark' | 'unknown';
  page_title?: string;
  do_not_track?: string;
  js_heap_size_mb?: number;
  local_storage_available?: boolean;
  cookies_enabled?: boolean;
  // UX Preferences
  prefers_reduced_motion?: boolean;
  prefers_high_contrast?: boolean;
  prefers_forced_colors?: boolean;
  // Privacy & Security
  is_bot?: boolean;
  is_in_app_browser?: boolean;
  pdf_viewer_enabled?: boolean;
  save_data?: boolean;
  // Performance Vitals
  perf_fcp_ms?: number;
  perf_lcp_ms?: number;
  perf_ttfb_ms?: number;
  perf_dom_load_ms?: number;
  perf_page_load_ms?: number;
  // Engagement
  scroll_depth_pct?: number;
  scroll_milestones?: string;
  time_on_page_sec?: number;
  click_count?: number;
  exit_intent?: boolean;
}

interface AnalyticsSummary {
  total_views: number;
  unique_paths: number;
  top_paths: { path: string; count: number }[];
  top_referrers: { referrer: string; count: number }[];
  views_today: number;
  views_this_week: number;
  daily_activity?: { date: string; count: number }[];
  available_languages?: string[];
  available_countries?: { name: string; code: string }[];
}

interface PageMeta {
  current_page: number;
  total_pages: number;
  total_count: number;
}

const getFlagEmoji = (countryCode?: string) => {
  if (!countryCode || countryCode === '??') return '🏳️';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🏳️';
  }
};

const deviceIcon = (osName: string) => {
  const os = (osName || '').toLowerCase();
  if (os.includes('android') || os.includes('ios')) {
    return <Smartphone className="w-4 h-4 text-blue-400" />;
  }
  return <Monitor className="w-4 h-4 text-slate-400" />;
};

const formatPath = (path: string) => path || '/';
const formatVisitorId = (id: string) => {
  if (!id || id === 'anonymous') return 'Anon';
  return id.substring(0, 8);
};

export const AdminAnalyticsPage = () => {
  const [views, setViews] = useState<PageView[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<PageView | null>(null);
  const { showToast } = useToastStore();

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { data } = await AdminApi.getAnalyticsSummary();
      setSummary(data);
    } catch {
      // Summary is optional — silently ignore
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchViews = useCallback(async (page: number, q = '', lang = '', country = '') => {
    setLoading(true);
    try {
      const { data } = await AdminApi.getPageViews(page, 50, q, lang, country);
      setViews(data.page_views || data || []);
      setMeta(data.meta || null);
    } catch {
      showToast('Błąd pobierania danych analitycznych', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchViews(1, search, languageFilter, countryFilter);
      setCurrentPage(1);
    }, 500); 
    return () => clearTimeout(timer);
  }, [search, languageFilter, countryFilter, fetchViews]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchViews(currentPage, search, languageFilter, countryFilter);
    }
    setPageInput(currentPage.toString());
  }, [currentPage, fetchViews, search, languageFilter, countryFilter]);

  const totalPages = meta?.total_pages ?? 1;

  const renderSparkline = useMemo(() => {
    if (!summary?.daily_activity || summary.daily_activity.length === 0) return null;
    const max = Math.max(...summary.daily_activity.map(d => d.count), 1);
    const len = summary.daily_activity.length;
    
    const points = summary.daily_activity.map((d, i) => ({
      x: len > 1 ? (i / (len - 1)) * 100 : 50,
      y: 100 - (d.count / max) * 100
    }));

    // Generate Path D
    const pathD = len > 1 
      ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` 
      : `M 0,${points[0].y} L 100,${points[0].y}`; // Horizontal line if only 1 point

    // Area Path (fills below the line)
    const areaD = len > 1 
      ? `${pathD} L 100,100 L 0,100 Z` 
      : `M 0,${points[0].y} L 100,${points[0].y} L 100,100 L 0,100 Z`;

    return (
      <div className="h-24 w-full bg-slate-50/50 rounded-xl p-3 overflow-hidden relative group/graph">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Shaded Area */}
          <path d={areaD} fill="url(#areaGradient)" className="transition-all duration-700" />
          
          {/* Main Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            className="text-primary transition-all duration-1000" 
          />
          
          {/* Data Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-white stroke-primary stroke-[2] shadow-sm" />
          ))}
        </svg>
      </div>
    );
  }, [summary?.daily_activity]);

  const DetailItem = ({ label, value, icon: Icon, highlight = false }: { label: string, value: unknown, icon?: React.ElementType, highlight?: boolean }) => {
    if (value === undefined || value === null || value === '' || value === 0) return null;
    return (
      <div className="flex border-b border-slate-50 py-3 last:border-0 hover:bg-slate-50/50 transition-colors px-1">
        <div className="w-[200px] shrink-0 flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-300" />}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex-1">
          <span className={`text-[11px] font-bold break-all select-all ${highlight ? 'text-primary' : 'text-slate-700'}`}>
            {String(value)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-in fade-in duration-500 space-y-8 relative pb-20">
      {/* Header */}
      <div className="mb-8 border-l-4 border-primary pl-6">
        <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-4">
          <TrendingUp className="w-10 h-10 text-primary" />
          Analityka
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
          Deep Telemetry & Activity Terminal
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Łącznie wizyt', value: summary?.total_views, Icon: Eye },
            { label: 'Unikalne strony', value: summary?.unique_paths, Icon: Globe },
            { label: 'Dzisiaj', value: summary?.views_today, Icon: Clock },
            { label: 'Ten tydzień', value: summary?.views_this_week, Icon: TrendingUp },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              </div>
              {summaryLoading ? (
                <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-black text-brand-dark tracking-tighter">{value ?? '—'}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktywność (7D)</p>
           </div>
           {summary?.daily_activity ? renderSparkline : (
             <div className="h-24 flex items-center justify-center italic text-[10px] text-slate-300">Generowanie wykresu...</div>
           )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="bg-brand-dark px-6 py-5 flex flex-col gap-4">
           {/* Row 1: Search */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="WYSZUKAJ IP, PATH LUB VISITOR ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800/50 border-0 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 text-[10px] font-bold focus:ring-2 focus:ring-primary focus:bg-slate-800 transition-all outline-none"
                  />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-[8px] font-black text-white/30 uppercase tracking-widest">Baza Logów</span>
                  <span className="text-[11px] font-black text-white uppercase">{meta?.total_count ?? 0} WPISÓW</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { fetchViews(1, search, languageFilter, countryFilter); fetchSummary(); setCurrentPage(1); }}
                  className="h-10 px-4 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-[9px] uppercase font-black tracking-widest rounded-xl transition-all"
                > Odśwież </Button>
              </div>
           </div>

           {/* Row 2: Filters */}
           <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 group hover:border-primary/50 transition-colors">
                 <Languages className="w-3.5 h-3.5 text-primary" />
                 <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}
                   className="bg-transparent text-white text-[9px] font-bold uppercase tracking-widest appearance-none outline-none pr-4 cursor-pointer"
                 >
                   <option value="" className="bg-brand-dark">Język (Wszystkie)</option>
                   {summary?.available_languages?.map(lang => (
                     <option key={lang} value={lang} className="bg-brand-dark">{lang}</option>
                   ))}
                 </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 group hover:border-primary/50 transition-colors">
                 <MapPin className="w-3.5 h-3.5 text-primary" />
                 <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
                   className="bg-transparent text-white text-[9px] font-bold uppercase tracking-widest appearance-none outline-none pr-4 cursor-pointer"
                 >
                   <option value="" className="bg-brand-dark">Kraj (Wszystkie)</option>
                   {summary?.available_countries?.map(c => (
                     <option key={c.code} value={c.code} className="bg-brand-dark">{getFlagEmoji(c.code)} {c.name}</option>
                   ))}
                 </select>
              </div>
              {(languageFilter || countryFilter || search) && (
                <button onClick={() => { setSearch(''); setLanguageFilter(''); setCountryFilter(''); }}
                        className="text-[9px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1 ml-2">
                  <Filter className="w-3 h-3" /> Reset
                </button>
              )}
           </div>
        </div>

        {loading && (
          <div className="absolute inset-x-0 bottom-0 top-[110px] bg-white/70 backdrop-blur-md z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse cursor-default">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 whitespace-nowrap">
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Czas & User</th>
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Region & Język</th>
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Strona & IP</th>
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Urządzenie & GPU</th>
                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Sieć / System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {views.map((pv) => (
                <tr key={pv.id} onClick={() => setSelectedView(pv)}
                  className={`transition-all whitespace-nowrap group hover:bg-slate-50/80 cursor-pointer ${selectedView?.id === pv.id ? 'bg-primary/5 !border-l-4 !border-l-primary' : 'border-l-0'}`}
                >
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-bold text-slate-500 group-hover:text-brand-dark transition-colors">
                        {new Date(pv.created_at).toLocaleDateString('pl-PL')} 
                        <span className="ml-1 text-slate-300">{new Date(pv.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 font-black uppercase tracking-widest">
                        <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200/50 group-hover:bg-white">ID: {formatVisitorId(pv.visitor_id)}</span>
                        {pv.color_scheme === 'dark' ? <Moon className="w-3 h-3 text-slate-400" /> : <Sun className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[16px]">{getFlagEmoji(pv.country_code)}</span>
                          <span className="text-[10px] font-black text-brand-dark uppercase tracking-tight">
                            {pv.city && <span className="text-slate-400 mr-1">{pv.city},</span>}
                            {pv.country || 'Nieznany Region'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           <Languages className="w-3 h-3 text-slate-300" /> <span>{pv.language}</span>
                        </div>
                     </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      <span className="text-[10px] font-black text-brand-dark font-mono truncate" title={pv.path}>{formatPath(pv.path)}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter">{pv.ip_address}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                       <span className="text-[10px] font-bold text-slate-600 flex items-center gap-2">
                         {deviceIcon(pv.os_name)} {pv.os_name}
                       </span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{pv.gpu_renderer || 'GPU: N/A'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1.5 text-[9px] font-bold text-slate-500/80">
                       <div className="flex items-center gap-2">
                         <Globe className="w-3.5 h-3.5 text-slate-300" />
                         <span>{pv.connection_type || 'Unknown'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <Battery className={`w-3.5 h-3.5 ${pv.battery_charging ? 'text-green-500' : 'text-slate-300'}`} />
                         <span>{pv.battery_level ? `${Math.round(pv.battery_level * 100)}%` : '—'}</span>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              Strona <span className="text-brand-dark">{currentPage}</span> / {totalPages}
            </span>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 h-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Idź do:</span>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => {
                  const val = parseInt(pageInput);
                  if (val >= 1 && val <= totalPages) setCurrentPage(val);
                  else setPageInput(currentPage.toString());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt(pageInput);
                    if (val >= 1 && val <= totalPages) setCurrentPage(val);
                    else setPageInput(currentPage.toString());
                  }
                }}
                className="w-14 h-8 bg-white border border-slate-200 rounded-lg text-center text-[11px] font-black text-brand-dark focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1 || loading} className="px-3 border border-slate-200 rounded-xl text-[9px]"> Pierwsza </Button>
             <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1 || loading} className="px-4 rounded-xl text-[9px]"> <ChevronLeft className="w-4 h-4 mr-1" /> Poprzednia </Button>
             <Button variant="secondary" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || loading} className="px-4 rounded-xl text-[9px]"> Następna <ChevronRight className="w-4 h-4 ml-1" /> </Button>
             <Button variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages || loading} className="px-3 border border-slate-200 rounded-xl text-[9px]"> Ostatnia </Button>
          </div>
        </div>
      </div>

      {/* DEEP INSPECTOR MODAL - RENDERED VIA PORTAL TO ESCAPE STACKING CONTEXTS */}
      {selectedView && createPortal(
        <div className="fixed inset-0 z-[9999] animate-in fade-in duration-300">
           {/* Pure backdrop - absolute to the fixed inset-0 */}
           <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl" onClick={() => setSelectedView(null)} />
           
           {/* Modal Container - Flex for centering */}
           <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12 lg:p-24 pointer-events-none">
              <div className="relative w-full max-w-5xl max-h-[92vh] bg-white shadow-2xl rounded-[3rem] animate-in zoom-in-95 duration-500 flex flex-col overflow-hidden pointer-events-auto">
              
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center relative group">
                <button 
                  onClick={() => setSelectedView(null)} 
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-brand-dark transition-all shadow-sm z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div>
                  <h2 className="text-2xl font-black text-brand-dark leading-none tracking-tighter uppercase italic">Głęboka Inspekcja</h2>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="px-2 py-1 bg-primary text-white text-[9px] font-black rounded uppercase">ID #{selectedView.id}</span>
                    <span className="text-[20px]">{getFlagEmoji(selectedView.country_code)}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visit Log</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedView(null)} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-brand-dark transition-all shadow-sm z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                
                {/* 1. Location & Identity */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lokalizacja & Sieć</h3>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-1">
                    <DetailItem label="Państwo" value={`${selectedView.country} (${selectedView.country_code})`} icon={Globe} highlight />
                    <DetailItem label="Miasto / Region" value={selectedView.city} icon={MapPin} highlight />
                    <DetailItem label="Adres IP" value={selectedView.ip_address} icon={Hash} highlight />
                    <DetailItem label="Dostawca (ISP)" value={selectedView.isp} icon={Radio} />
                    <DetailItem label="Język Przeglądarki" value={selectedView.language} icon={Languages} />
                    <DetailItem label="Wszystkie Języki" value={selectedView.languages} icon={Languages} />
                    <DetailItem label="Strefa Czasowa" value={selectedView.timezone} icon={Clock} />
                    <DetailItem label="Offset UTC" value={`${selectedView.timezone_offset_minutes}m`} icon={Clock} />
                  </div>
                </section>

                {/* 2. Hardware Spec */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Specyfikacja Sprzętowa</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-1">
                    <DetailItem label="System Operacyjny" value={`${selectedView.os_name} ${selectedView.os_version}`} icon={Monitor} />
                    <DetailItem label="Przeglądarka" value={`${selectedView.browser_name} ${selectedView.browser_version}`} icon={Smartphone} />
                    <DetailItem label="GPU Vendor" value={selectedView.gpu_vendor} icon={Layers} />
                    <DetailItem label="GPU Renderer" value={selectedView.gpu_renderer} icon={Layers} highlight />
                    <DetailItem label="Architektura CPU" value={selectedView.cpu_architecture?.toUpperCase()} icon={Cpu} highlight />
                    <DetailItem label="Model Urządzenia" value={selectedView.device_model} icon={Smartphone} highlight />
                    <DetailItem label="Platforma (W3C)" value={selectedView.platform} icon={Monitor} />
                    <DetailItem label="Vendor Silnika" value={selectedView.vendor} icon={Globe} />
                    <DetailItem label="Rdzenie CPU" value={selectedView.hardware_concurrency} icon={Cpu} />
                    <DetailItem label="Pamięć RAM (Est.)" value={selectedView.device_memory_gb ? `${selectedView.device_memory_gb} GB` : 'Brak danych'} icon={Database} />
                    <DetailItem label="Touch Points" value={selectedView.max_touch_points} icon={MousePointer2} />
                  </div>
                </section>

                {/* 3. Display & UI Context */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Monitor className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ekran & Wyświetlanie</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-1">
                    <DetailItem label="Rozdzielczość Ekranu" value={`${selectedView.screen_width} × ${selectedView.screen_height}`} icon={Monitor} />
                    <DetailItem label="Viewport (Aktualny)" value={`${selectedView.viewport_width} × ${selectedView.viewport_height}`} icon={Eye} />
                    <DetailItem label="Orientacja" value={selectedView.screen_orientation} icon={Activity} />
                    <DetailItem label="Pixel Ratio (DPR)" value={selectedView.device_pixel_ratio} icon={Info} />
                    <DetailItem label="Motyw Systemowy" value={selectedView.color_scheme?.toUpperCase()} icon={Sun} />
                    <DetailItem label="Głębia Kolorów" value={`${selectedView.screen_color_depth}-bit`} icon={Layers} />
                  </div>
                </section>

                {/* 4. Connection & Battery */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Parametry Połączenia & Energii</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-1">
                    <DetailItem label="Typ Połączenia" value={selectedView.connection_type} icon={Globe} />
                    <DetailItem label="Standard (Effective)" value={selectedView.connection_effective_type?.toUpperCase()} icon={Activity} />
                    <DetailItem label="Szybkość (Downlink)" value={selectedView.connection_downlink_mbps ? `${selectedView.connection_downlink_mbps} Mbps` : 'N/A'} icon={TrendingUp} />
                    <DetailItem label="Opóźnienie (RTT)" value={selectedView.connection_rtt_ms ? `${selectedView.connection_rtt_ms} ms` : 'N/A'} icon={Activity} />
                    <DetailItem label="Poziom Baterii" value={selectedView.battery_level ? `${Math.round(selectedView.battery_level * 100)}%` : 'N/A'} icon={Battery} />
                    <DetailItem label="Status Ładowania" value={selectedView.battery_charging ? 'ŁADUJE' : 'BRAK ŁADOWANIA'} icon={Battery} />
                  </div>
                </section>

                {/* 5. Browser Internals */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <HardDrive className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Wnętrze Przeglądarki</h3>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-1">
                    <DetailItem label="JS Heap Used" value={selectedView.js_heap_size_mb ? `${selectedView.js_heap_size_mb} MB` : 'N/A'} icon={Activity} />
                    <DetailItem label="Limit Storage (Quota)" value={selectedView.storage_quota_mb ? `${selectedView.storage_quota_mb} MB` : 'N/A'} icon={HardDrive} />
                    <DetailItem label="Użycie Storage" value={selectedView.storage_usage_mb ? `${selectedView.storage_usage_mb} MB` : 'N/A'} icon={HardDrive} />
                    <DetailItem label="Cookies Włączone" value={selectedView.cookies_enabled ? 'TAK' : 'NIE'} icon={Info} />
                    <DetailItem label="LocalStorage Włączone" value={selectedView.local_storage_available ? 'TAK' : 'NIE'} icon={Info} />
                    <DetailItem label="Do Not Track (DNT)" value={selectedView.do_not_track || 'Brak'} icon={Info} />
                  </div>
                </section>

                {/* 6. Performance Vitals */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Vitale Wydajności (RUM)</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-1">
                    <DetailItem label="FCP (First Paint)" value={selectedView.perf_fcp_ms ? `${selectedView.perf_fcp_ms} ms` : undefined} icon={Activity} highlight />
                    <DetailItem label="LCP (Largest Paint)" value={selectedView.perf_lcp_ms ? `${selectedView.perf_lcp_ms} ms` : undefined} icon={Activity} highlight />
                    <DetailItem label="TTFB (Server Resp.)" value={selectedView.perf_ttfb_ms ? `${selectedView.perf_ttfb_ms} ms` : undefined} icon={Radio} />
                    <DetailItem label="DOM Załadowany" value={selectedView.perf_dom_load_ms ? `${selectedView.perf_dom_load_ms} ms` : undefined} icon={Layers} />
                    <DetailItem label="Strona Załadowana" value={selectedView.perf_page_load_ms ? `${selectedView.perf_page_load_ms} ms` : undefined} icon={Clock} />
                  </div>
                </section>

                {/* 6b. Engagement */}
                {(selectedView.scroll_depth_pct !== undefined || selectedView.time_on_page_sec !== undefined) && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <MousePointer2 className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Zaangażowanie Użytkownika</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                    {selectedView.scroll_depth_pct !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Głębokość Scrolla</span>
                          <span className="text-[11px] font-black text-primary">{selectedView.scroll_depth_pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${selectedView.scroll_depth_pct}%` }} />
                        </div>
                        {selectedView.scroll_milestones && (
                          <div className="flex gap-1 mt-2">
                            {[25, 50, 75, 100].map(m => (
                              <span key={m} className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${selectedView.scroll_milestones?.includes(String(m)) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-300'}`}>{m}%</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <DetailItem label="Czas na Stronie" value={selectedView.time_on_page_sec !== undefined ? `${selectedView.time_on_page_sec}s` : undefined} icon={Clock} highlight />
                    <DetailItem label="Liczba Kliknięć" value={selectedView.click_count} icon={MousePointer2} />
                    <DetailItem label="Exit Intent" value={selectedView.exit_intent ? '⚠️ TAK (opuścił kursorem)' : 'NIE'} icon={Activity} highlight={selectedView.exit_intent} />
                  </div>
                </section>
                )}

                {/* 7. UX Preferences */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Sun className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Preferencje UX & Dostępności</h3>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-1">
                    <DetailItem label="Motyw Systemowy" value={selectedView.color_scheme?.toUpperCase()} icon={Sun} />
                    <DetailItem label="Redukcja Animacji" value={selectedView.prefers_reduced_motion ? 'TAK (Ograniczone)' : 'NIE'} icon={Activity} />
                    <DetailItem label="Wysoki Kontrast" value={selectedView.prefers_high_contrast ? 'TAK' : 'NIE'} icon={Monitor} />
                    <DetailItem label="Wymuszone Kolory" value={selectedView.prefers_forced_colors ? 'TAK (Windows)' : 'NIE'} icon={Layers} />
                  </div>
                </section>

                {/* 8. Privacy & Security */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Prywatność & Bezpieczeństwo</h3>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-1">
                    <DetailItem label="Bot / Crawler" value={selectedView.is_bot ? '⚠️ TAK (webdriver)' : 'NIE'} icon={Info} highlight={selectedView.is_bot} />
                    <DetailItem label="Przeglądarka In-App" value={selectedView.is_in_app_browser ? '⚠️ TAK (FB/IG/TikTok)' : 'NIE'} icon={Smartphone} highlight={selectedView.is_in_app_browser} />
                    <DetailItem label="Tryb Oszczędny (Data)" value={selectedView.save_data ? '⚠️ TAK' : 'NIE'} icon={Radio} />
                    <DetailItem label="Przeglądarka PDF" value={selectedView.pdf_viewer_enabled ? 'TAK' : 'NIE'} icon={HardDrive} />
                    <DetailItem label="Do Not Track (DNT)" value={selectedView.do_not_track || 'Brak'} icon={Info} />
                    <DetailItem label="Cookies Włączone" value={selectedView.cookies_enabled ? 'TAK' : 'NIE'} icon={Info} />
                    <DetailItem label="LocalStorage" value={selectedView.local_storage_available ? 'TAK' : 'NIE'} icon={HardDrive} />
                  </div>
                </section>

                <section className="pb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Nagłówek User Agent</h3>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-2xl shadow-inner group">
                    <p className="text-[10px] font-mono text-slate-400 leading-relaxed break-all select-all group-hover:text-slate-200 transition-colors">
                      {selectedView.user_agent}
                    </p>
                  </div>
                </section>

              </div>
           </div>
        </div>
      </div>,
      document.body
      )}
    </div>
  );
};
