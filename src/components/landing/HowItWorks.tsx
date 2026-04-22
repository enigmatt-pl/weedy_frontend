import { Search, Info, Navigation } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    number: '1',
    title: 'Wyszukaj punkt',
    description: 'Wpisz miasto lub pozwól wykryć Twoją lokalizację. Przeszukamy bazę tysięcy zweryfikowanych punktów w całej Polsce.',
  },
  {
    icon: Info,
    number: '2',
    title: 'Sprawdź szczegóły',
    description: 'Zobacz godziny otwarcia, dostępny asortyment CBD i konopny, aktualne opinie oraz zdjęcia wybranego punktu.',
  },
  {
    icon: Navigation,
    number: '3',
    title: 'Dotrzyj na miejsce',
    description: 'Skorzystaj z nawigacji, aby dotrzeć pod właściwy adres. Dzięki Weedy zawsze wiesz, gdzie i co znajdziesz.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6 md:px-10 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark tracking-tight mb-4">
            Jak to działa?
          </h2>
          <p className="text-slate-500 font-medium text-base max-w-lg mx-auto">
            Trzy proste kroki do znalezienia idealnego punktu w Twojej okolicy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 z-0" />

          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-primary text-white text-4xl font-black rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30 ring-8 ring-emerald-50 transition-transform hover:scale-105 duration-300">
                {step.number}
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center flex-1 w-full hover:shadow-2xl hover:border-primary/10 transition-all duration-500">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
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
