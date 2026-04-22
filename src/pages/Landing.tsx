import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans selection:bg-primary selection:text-white">
      <nav className="flex items-center justify-between px-10 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center">
          <Logo size="md" />
        </div>
        <div className="flex items-center gap-6">
          <Button onClick={() => navigate('/login')} variant="ghost" className="text-[9px] font-bold tracking-wide text-slate-500 hover:text-primary transition-colors">
            [ Logowanie ]
          </Button>
          <Button onClick={() => navigate('/register')} className="bg-primary text-white text-[9px] font-bold tracking-wide px-4 py-2 rounded">
            Dołącz do Sieci
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-dark py-24 px-10 border-b-8 border-primary">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="max-w-6xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest mb-8">
              <Zap className="w-3 h-3 fill-primary" />
              WEEDY ANALYTICS v1.0 — LIVE DATA
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-none uppercase">
              Największa Baza <br />
              <span className="text-primary ">Dispensaries w Polsce</span>
            </h1>
            <p className="text-xl text-emerald-100/60 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              Odkryj lokalne punkty, sprawdź dostępność i opinie. 
              Wykorzystujemy <span className="text-white">zaawansowaną analitykę</span>, aby dostarczyć Ci 
              najbardziej aktualne informacje o rynku w Twojej okolicy.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/home')}
                className="px-10 py-5 bg-primary text-white text-[11px] font-bold tracking-wider rounded shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all"
              >
                URUCHOM WYSZUKIWARKĘ
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => navigate('/register')}
                className="px-10 py-5 border border-white/20 text-white text-[11px] font-bold tracking-wider rounded hover:bg-white/5 transition-all"
              >
                DODAJ SWÓJ PUNKT
              </Button>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-10 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-white p-10 rounded border border-slate-200 shadow-sm border-b-4 border-b-slate-100 hover:border-b-primary transition-all duration-500">
            <div className="w-14 h-14 bg-brand-dark rounded flex items-center justify-center mb-8 shadow-xl">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4 tracking-tight">Inteligentna Mapa</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Geolokalizacja w czasie rzeczywistym pozwala znaleźć najbliższe otwarte punkty 
              z uwzględnieniem aktualnych godzin pracy i dostępności towaru.
            </p>
          </div>

          <div className="bg-white p-10 rounded border border-slate-200 shadow-sm border-b-4 border-b-slate-100 hover:border-b-primary transition-all duration-500">
            <div className="w-14 h-14 bg-brand-dark rounded flex items-center justify-center mb-8 shadow-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4 tracking-tight">Analityka Rynku</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Monitorujemy trendy rynkowe i ceny, dostarczając użytkownikom oraz właścicielom 
              punktów bezcenne dane statystyczne.
            </p>
          </div>

          <div className="bg-white p-10 rounded border border-slate-200 shadow-sm border-b-4 border-b-slate-100 hover:border-b-primary transition-all duration-500">
            <div className="w-14 h-14 bg-brand-dark rounded flex items-center justify-center mb-8 shadow-xl">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-4 tracking-tight">Społeczność i Opinie</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Zintegrowany system weryfikowanych opinii pomaga wybrać najlepsze miejsca 
              bazując na doświadczeniach innych pacjentów i klientów.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
