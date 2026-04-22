import { Clock, CheckCircle2, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const ROI_DATA = [
  {
    icon: Clock,
    title: 'Szybkość decyzji',
    description: 'Aktualne dane pomagają pacjentom znaleźć otwarty punkt z odpowiednim asortymentem w kilka sekund.',
    benefit: 'Live Data',
  },
  {
    icon: CheckCircle2,
    title: 'Sprawdzone informacje',
    description: 'Eliminujemy przestarzałe wpisy — godziny otwarcia, lokalizacja i dostępność są zawsze aktualizowane.',
    benefit: '100% Aktualności',
  },
  {
    icon: TrendingUp,
    title: 'Wzrost widoczności',
    description: 'Dla właścicieli punktów: dotrzyj do tysięcy klientów szukających dokładnie tego, co oferujesz.',
    benefit: '+300% zasięgu',
  },
];

export const ROI = () => {
  return (
    <section id="roi" className="py-24 px-6 md:px-10 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-16">
        <div className="flex-1">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark tracking-tight mb-4">Analityka, która wspiera Twój wybór</h2>
            <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md">
              Dane, które pomagają pacjentom i właścicielom punktów lepiej zrozumieć lokalny rynek.
            </p>
          </div>

          <div className="space-y-4">
            {ROI_DATA.map((roi, idx) => (
              <div key={idx} className="bg-white flex gap-5 rounded-3xl border border-slate-100 p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-3 right-4 text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors tracking-widest uppercase">
                  {roi.benefit}
                </div>
                <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <roi.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark mb-1.5 tracking-tight">
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

        <div className="flex-1 w-full flex flex-col gap-4">
          <div className="bg-slate-100 text-slate-700 p-10 rounded-3xl relative overflow-hidden">
            <TrendingDown className="absolute -bottom-4 -right-4 w-28 h-28 opacity-10 rotate-45" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Bez Weedy</h4>
            <div className="text-2xl font-bold text-slate-500 mb-2 line-through decoration-red-400">Chaos i niepewność</div>
            <p className="text-sm font-medium text-slate-400">Nieaktualne informacje, zmarnowany czas, puste wizyty.</p>
          </div>

          <div className="bg-primary text-white p-10 rounded-3xl relative overflow-hidden shadow-2xl shadow-emerald-500/30">
            <Zap className="absolute -bottom-4 -right-4 w-28 h-28 opacity-20 rotate-12" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Z Weedy</h4>
            <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">Pełna kontrola</div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/70">Precyzyjna mapa · Aktualne dane · Zero niespodzianek</p>
          </div>
        </div>
      </div>
    </section>
  );
};
