import { Zap, Smartphone, CheckCircle2, DollarSign } from 'lucide-react';

const FEATURE_DATA = [
  {
    icon: Zap,
    title: 'Analityka Live',
    description: 'Monitorujemy rynek w czasie rzeczywistym, dostarczając dane o dostępności i cenach w Twojej okolicy.',
  },
  {
    icon: CheckCircle2,
    title: 'Weryfikowane Opinie',
    description: 'System oparty na zaufaniu. Tylko prawdziwi pacjenci i klienci mogą oceniać punkty na mapie.',
  },
  {
    icon: Smartphone,
    title: 'Zawsze Mobilnie',
    description: 'Aplikacja zoptymalizowana pod urządzenia przenośne. Znajdź punkt bez względu na to, gdzie jesteś.',
  },
  {
    icon: CheckCircle2,
    title: 'Pełna Baza Punktów',
    description: 'Od dużych miast po małe miasteczka. Weedy posiada najbardziej kompletną bazę punktów w Polsce.',
  },
  {
    icon: DollarSign,
    title: 'Darmowa Wyszukiwarka',
    description: 'Dla użytkowników poszukujących punktów wyszukiwarka jest i zawsze będzie całkowicie darmowa.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-10 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 border-l-4 border-primary pl-6">
          <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tight">Dane, które mają znaczenie</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">Dostarczamy najbardziej precyzyjne informacje o lokalnym rynku.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_DATA.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-brand-dark rounded flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black text-brand-dark mb-4 uppercase tracking-tighter leading-tight">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
