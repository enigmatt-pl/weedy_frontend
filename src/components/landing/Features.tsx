import { MapPin, Zap, CheckCircle2, Smartphone, DollarSign, Clock } from 'lucide-react';

const FEATURE_DATA = [
  {
    icon: Zap,
    title: 'Analityka na żywo',
    description: 'Monitorujemy rynek w czasie rzeczywistym — dostępność asortymentu i godziny otwarcia zawsze aktualne.',
  },
  {
    icon: CheckCircle2,
    title: 'Weryfikowane opinie',
    description: 'System oparty na zaufaniu. Tylko prawdziwi klienci mogą wystawiać recenzje punktów na naszej mapie.',
  },
  {
    icon: MapPin,
    title: 'Inteligentna mapa',
    description: 'Geolokalizacja w czasie rzeczywistym pokazuje najbliższe otwarte punkty z uwzględnieniem Twojego położenia.',
  },
  {
    icon: Smartphone,
    title: 'Zawsze mobilnie',
    description: 'Zoptymalizowane pod każde urządzenie. Znajdź punkt kiedy i gdzie potrzebujesz.',
  },
  {
    icon: Clock,
    title: 'Pełna baza punktów',
    description: 'Od dużych miast po małe miejscowości. Weedy ma najkompletniejszą bazę dispensary w Polsce.',
  },
  {
    icon: DollarSign,
    title: 'Darmowa wyszukiwarka',
    description: 'Wyszukiwanie dla pacjentów i klientów jest i zawsze będzie całkowicie bezpłatne.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-6 md:px-10 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-4 tracking-tight">Dane, które mają znaczenie</h2>
          <p className="text-slate-500 font-medium text-base max-w-xl mx-auto">Dostarczamy najbardziej precyzyjne informacje o lokalnym rynku dispensary w Polsce.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_DATA.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-500 group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-brand-dark mb-3 tracking-tight">
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
