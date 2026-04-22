import { FileText, Cpu, Globe } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    number: '1',
    title: 'Wyszukaj Punkt',
    description: 'Wprowadź miasto lub pozwól nam wykryć Twoją lokalizację. Przeszukamy bazę tysięcy zweryfikowanych punktów.',
  },
  {
    icon: Cpu,
    number: '2',
    title: 'Sprawdź Detale',
    description: 'Zobacz godziny otwarcia, dostępny asortyment oraz aktualne opinie innych pacjentów i klientów.',
  },
  {
    icon: Globe,
    number: '3',
    title: 'Odbierz Towar',
    description: 'Skorzystaj z nawigacji, aby dotrzeć do wybranego punktu. Dzięki Weedy zawsze trafisz pod właściwy adres.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-10 bg-brand-dark scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 italic">
            Jak to działa?
          </h2>
          <div className="w-24 h-2 bg-primary mx-auto rounded shadow-lg shadow-primary/30" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-white/10 z-0" />
          
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-primary text-white text-3xl font-black italic rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary/40 border-[8px] border-brand-dark ring-2 ring-white/10">
                {step.number}
              </div>
              <div className="bg-white/5 p-8 rounded border border-white/10 backdrop-blur-sm shadow-xl text-center flex-1 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
