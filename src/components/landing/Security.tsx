import { ShieldCheck, Lock, Fingerprint } from 'lucide-react';

const SECURITY_DATA = [
  {
    icon: ShieldCheck,
    title: 'Anonimowość',
    description: 'Twoje wyszukiwania są prywatne. Nie profilujemy użytkowników bez ich wyraźnej zgody.',
  },
  {
    icon: Fingerprint,
    title: 'Zgodność z RODO',
    description: 'Pełna ochrona danych osobowych i prywatności zgodnie z najwyższymi standardami UE.',
  },
  {
    icon: Lock,
    title: 'Szyfrowanie SSL',
    description: 'Wszystkie połączenia są szyfrowane protokołem klasy bankowej — Twoje dane są bezpieczne.',
  },
];

export const Security = () => {
  return (
    <section id="security" className="py-24 px-6 md:px-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mb-6 leading-tight">
            Bezpieczeństwo i prywatność
          </h2>
          <p className="text-slate-500 font-medium text-base leading-relaxed mb-8">
            Prywatność użytkowników jest naszym priorytetem. Działamy transparentnie i w zgodzie z prawem.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">GDPR Verified</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bank-Grade SSL</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECURITY_DATA.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-500 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
