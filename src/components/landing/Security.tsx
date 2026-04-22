import { ShieldCheck, Lock, Fingerprint } from 'lucide-react';

const SECURITY_DATA = [
  {
    icon: ShieldCheck,
    title: 'Anonimowość',
    description: 'Twoje dane wyszukiwania są prywatne. Nie profilujemy użytkowników bez ich wyraźnej zgody.',
  },
  {
    icon: Fingerprint,
    title: 'Zgodność z RODO',
    description: 'Pełna ochrona danych osobowych i prywatności zgodnie z najwyższymi standardami UE.',
  },
  {
    icon: Lock,
    title: 'Szyfrowanie SSL',
    description: 'Wszystkie połączenia z naszymi serwerami są szyfrowane protokołem klasy bankowej.',
  },
];

export const Security = () => {
  return (
    <section id="security" className="py-24 px-10 bg-brand-dark overflow-hidden relative scroll-mt-20">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 w-full order-2 lg:order-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {SECURITY_DATA.map((security, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-lg backdrop-blur-md shadow-2xl hover:border-primary/40 transition-all duration-500 group">
                <div className="w-12 h-12 bg-primary rounded flex items-center justify-center mb-6 shadow-xl shadow-primary/20 ring-4 ring-primary/10 group-hover:scale-110 transition-transform">
                  <security.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tighter">
                  {security.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {security.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:w-1/3 order-1 lg:order-2">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic mb-6 leading-[0.9]">Standardy bezpieczeństwa</h2>
            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-10 border-l-4 border-primary pl-6 leading-relaxed">
              Prywatność użytkowników jest naszym priorytetem. Działamy transparentnie i bezpiecznie.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full grayscale opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[9px] text-white font-black uppercase tracking-widest">GDPR Verified</span>
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full grayscale opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2">
                <Lock className="w-3 h-3 text-primary" />
                <span className="text-[9px] text-white font-black uppercase tracking-widest">Bank-Grade SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
