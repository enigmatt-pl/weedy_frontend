import { TrendingUp, Clock, AlertCircle, TrendingDown, Zap } from 'lucide-react';

const ROI_DATA = [
  {
    icon: Clock,
    title: 'Szybkość decyzji',
    description: 'Dzięki aktualnym danym pacjenci znajdują to, czego potrzebują w kilka sekund.',
    benefit: 'Live Tracking',
  },
  {
    icon: AlertCircle,
    title: 'Sprawdzone Dane',
    description: 'Eliminujemy nieaktualne informacje o godzinach otwarcia czy lokalizacji.',
    benefit: '100% Accuracy',
  },
  {
    icon: TrendingUp,
    title: 'Wzrost Widoczności',
    description: 'Dla właścicieli punktów: dotrzyj do tysięcy pacjentów szukających Twoich usług.',
    benefit: '+300% zasięgu',
  },
];

export const ROI = () => {
  return (
    <section id="roi" className="py-24 px-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tight mb-4 leading-tight">Analityka, która wspiera Twój wybór</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 border-l-4 border-slate-900 pl-6">
              Dostarczamy dane, które pomagają pacjentom i właścicielom punktów lepiej zrozumieć rynek.
            </p>
          </div>
          
          <div className="space-y-6">
            {ROI_DATA.map((roi, idx) => (
              <div key={idx} className="flex gap-6 rounded border border-slate-100 p-8 hover:border-primary/20 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 bg-brand-dark/5 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  {roi.benefit}
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center mb-6 shadow-sm flex-shrink-0 group-hover:bg-primary/20 transition-all">
                  <roi.icon className="w-5 h-5 text-brand-dark group-hover:text-primary transition-all" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-dark mb-2 uppercase tracking-tighter">
                    {roi.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {roi.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="bg-brand-dark text-white p-10 rounded shadow-2xl relative overflow-hidden transform hover:-rotate-1 transition-transform">
            <TrendingDown className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 text-primary rotate-45" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Tradycyjne szukanie</h4>
            <div className="flex items-center gap-3 text-4xl font-black text-slate-300 mb-2">
              <span className="line-through decoration-red-500">Chaos i Niepewność</span>
            </div>
            <p className="text-xs font-medium text-slate-500">Brak aktualnych informacji, strata czasu.</p>
          </div>
          
          <div className="bg-primary text-white p-10 rounded shadow-2xl relative overflow-hidden transform hover:rotate-1 transition-transform border-[12px] border-white/10 ring-8 ring-brand-dark">
            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 text-white rotate-12" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">Standard Weedy</h4>
            <div className="flex items-center gap-3 text-6xl font-black text-white mb-2 tracking-tighter italic">
              Pełna Kontrola
            </div>
            <p className="text-sm font-black uppercase tracking-widest">Precyzyjna mapa. Aktualne dane.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
