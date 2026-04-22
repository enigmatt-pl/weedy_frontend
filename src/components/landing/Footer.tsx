import { Logo } from '../ui/Logo';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Search, UserPlus } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="py-20 bg-slate-50 border-t border-slate-100 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 items-start">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Logo size="lg" />
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm">
              Inteligentna wyszukiwarka punktów CBD i medycznej marihuany w Polsce. Znajdź najbliższe dispensary, sprawdź dostępność i opinie.
            </p>
            <div className="flex gap-3">
              <Link
                to="/search"
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Search className="w-4 h-4" />
                Szukaj
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Dodaj Punkt
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Nawigacja</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Znajdź dispensary', href: '/search' },
                { label: 'Funkcje', href: '#features' },
                { label: 'Jak działamy', href: '#how-it-works' },
                { label: 'Cennik dla punktów', href: '#pricing' },
                { label: 'Bezpieczeństwo', href: '#security' },
              ].map((link) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Kontakt</h4>
              <a href="mailto:enigmatt.eu@gmail.com" className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-primary/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">enigmatt.eu@gmail.com</span>
              </a>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Certyfikaty</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">Zweryfikowana baza punktów</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Szyfrowanie SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-400">
            &copy; {new Date().getFullYear()} Weedy. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-4 text-sm font-medium text-slate-400">
            <a href="/legal/regulamin.md" className="hover:text-primary transition-colors">Regulamin</a>
            <a href="/legal/polityka.md" className="hover:text-primary transition-colors">Polityka prywatności</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
