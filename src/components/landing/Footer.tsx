import { Logo } from '../ui/Logo';
import { Mail, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-24 bg-white border-t border-slate-200 px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 items-center md:items-start text-center md:text-left">
          <div className="col-span-1 md:col-span-2 space-y-8 flex flex-col items-center md:items-start">
            <Logo size="lg" className="grayscale-0" />
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md">
              Inteligentna wyszukiwarka punktów w Polsce. Znajdź najbliższe dispensary, sprawdź dostępność i opinie pacjentów.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Nawigacja</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Funkcje', href: '#features' },
                { label: 'Jak działamy', href: '#how-it-works' },
                { label: 'Analityka', href: '#roi' },
                { label: 'Dla Punktów', href: '#pricing' },
                { label: 'Bezpieczeństwo', href: '#security' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>          
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Wymiana informacji</h4>
            <a href="mailto:enigmatt.eu@gmail.com" className="flex items-center gap-3 text-slate-900 hover:text-primary transition-colors font-black uppercase tracking-widest text-[11px] justify-center md:justify-start">
              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              enigmatt.eu@gmail.com
            </a>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Certyfikaty</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-900 transition-colors font-black uppercase tracking-widest text-[11px] justify-center md:justify-start">
                <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                Zweryfikowana Baza Punktów
              </div>
              <div className="flex items-center gap-3 text-slate-900 transition-colors font-black uppercase tracking-widest text-[11px] justify-center md:justify-start">
                <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                Szyfrowanie SSL klasy bankowej
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Operator</h4>
            <div className="flex items-center gap-3 text-slate-900 transition-colors font-black uppercase tracking-widest text-[11px] justify-center md:justify-start">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              Bezpieczeństwo OAuth 2.0
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] truncate">
            &copy; {new Date().getFullYear()} WEEDY. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-6 grayscale opacity-40 hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-300 hover:text-primary cursor-pointer hover:border-primary transition-all">
              <span className="text-[10px] font-black italic">TW</span>
            </div>
            <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-300 hover:text-primary cursor-pointer hover:border-primary transition-all">
              <span className="text-[10px] font-black italic">FB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
