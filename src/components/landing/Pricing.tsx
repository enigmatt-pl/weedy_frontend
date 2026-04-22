import { Link } from 'react-router-dom';
import { Check, Zap, Package, Sparkles, MessageSquare } from 'lucide-react';

export const Pricing = () => {
  const isBeta = import.meta.env.VITE_BETA_MODE === 'true';

  if (isBeta) {
    return (
      <section id="pricing" className="py-24 px-10 bg-brand-dark scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="mb-16 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Program Wczesnego Dostępu</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-tight italic">
              Zasilamy Twój biznes <span className="text-primary italic">bezpłatnie</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-2xl mx-auto leading-relaxed">
              Faza Beta to czas na wspólny rozwój. W zamian za merytoryczny feedback, my zapewniamy darmowe limity na start Twojej przygody z AI.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl p-8 md:p-16 rounded-[2rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Twój aktywny plan</h3>
                  <h4 className="text-4xl font-black text-white uppercase tracking-tight italic">Weedy Beta Partner</h4>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-7xl md:text-8xl font-black text-white tracking-tighter italic">0,00</span>
                  <div className="flex flex-col">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] line-through opacity-50">149,00 PLN</span>
                    <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">PLN / NETTO MC</span>
                  </div>
                </div>

                <div className="space-y-5 pt-8 border-t border-slate-800">
                  {[
                    'Darmowa wizytówka Twojego punktu na mapie',
                    'Dostęp do panelu analitycznego Weedy Analytics',
                    'Możliwość dodawania aktualnego asortymentu',
                    'System weryfikacji opinii pacjentów',
                    'Promocja w wynikach wyszukiwania lokalnego'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 group/item">
                      <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                        <Check className="w-3 h-3 text-primary group-hover/item:text-white" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-dark p-10 rounded-3xl border border-slate-800 shadow-3xl relative">
                <div className="absolute -top-4 -right-4 bg-primary text-white text-[9px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest animate-bounce">
                  Limited Spots
                </div>
                
                <div className="flex items-center gap-4 mb-8 text-primary">
                  <MessageSquare className="w-8 h-8" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.3em]">Protokół Współpracy</h5>
                </div>

                <p className="text-sm md:text-base text-slate-400 font-medium leading-relaxed italic mb-10 border-l-2 border-primary pl-6">
                  "Dołączając do nas w fazie Beta, zyskujesz dożywotni status Partnera oraz darmowy dostęp do wszystkich funkcji analitycznych i promocyjnych przez pierwsze 12 miesięcy."
                </p>
                <Link 
                  to="/register"
                  className="w-full py-6 bg-white text-brand-dark text-[12px] font-black uppercase tracking-[0.4em] rounded-xl shadow-2xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 block text-center"
                >
                  Dołącz do Beta za darmo
                </Link>
                <p className="text-center text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-6">
                  Inicjalizacja profilu zajmuje mniej niż 30 sekund
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 px-10 bg-slate-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tight mb-4 leading-tight">Prosty cennik</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Prosty system rozliczeń. Płacisz tylko za to, co wystawiasz.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex-1 bg-white p-10 rounded border border-slate-200 shadow-xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Basic</div>
            <h3 className="text-3xl font-black text-brand-dark mb-2 uppercase tracking-tighter italic">Pakiet Startowy</h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-brand-dark tracking-tighter">74,50</span>
              <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">PLN NETTO / MC</span>
            </div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {[
                { label: 'Obejmuje do 100 ofert na Platform', icon: Package },
                { label: 'Pełen dostęp do silnika AI i produktyzacji', icon: Zap },
                { label: 'Brak prowizji od sprzedaży', icon: Check },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.label}
                </li>
              ))}
            </ul>

            <Link 
              to="/register"
              className="w-full py-4 bg-brand-dark text-white text-[11px] font-black uppercase tracking-[0.2em] rounded group-hover:bg-primary transition-all shadow-xl block text-center"
            >
              Zacznij Przygodę
            </Link>
          </div>

          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {[
              { range: '101 - 300 ofert', price: '0,49' },
              { range: '301 - 800 ofert', price: '0,44' },
              { range: '800+ ofert', price: '0,39' },
            ].map((tier, idx) => (
              <div key={idx} className="bg-brand-dark p-6 rounded flex items-center justify-between border-l-8 border-primary shadow-2xl hover:scale-105 transition-transform duration-300 group">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skala</h4>
                  <p className="text-xl font-black text-white italic tracking-tighter">{tier.range}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white tracking-tighter">{tier.price} <span className="text-xs">zł</span></p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary">NETTO / SZT</p>
                </div>
              </div>
            ))}
            <div className="p-6 border-2 border-dashed border-slate-200 rounded text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wszystkie funkcje AI dostępne bez dopłat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
