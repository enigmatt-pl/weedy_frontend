import { useState } from 'react';
import { useLegalStore } from '../store/legalStore';
import { LegalModal } from './LegalModal';
import { AlertCircle } from 'lucide-react';

export const LegalCheckboxGroup = () => {
  const { 
    acceptedTerms, 
    acceptedPrivacy, 
    setAcceptedTerms, 
    setAcceptedPrivacy 
  } = useLegalStore();

  const [modalData, setModalData] = useState<{ isOpen: boolean; filePath: string; title: string }>({
    isOpen: false,
    filePath: '',
    title: '',
  });

  const openModal = (filePath: string, title: string) => {
    setModalData({ isOpen: true, filePath, title });
  };

  const closeModal = () => {
    setModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200 mt-2">
      <div className="flex items-center gap-3 border-l-2 border-primary pl-4 mb-4">
        <AlertCircle className="w-4 h-4 text-primary" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Wymagane Zgody Operacyjne</h4>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-primary transition-all group">
          <input 
            type="checkbox" 
            checked={!!acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-slate-200 text-primary focus:ring-primary focus:ring-offset-2"
          />
          <div className="flex-1">
            <p className="text-xs font-black text-brand-dark uppercase tracking-tight">Akceptuję Regulamin Fazy BETA</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">
              Rozumiem eksperymentalny charakter systemu i całkowicie zrzekam się roszczeń odszkodowawczych.
              <button 
                type="button" 
                onClick={() => openModal('/legal/regulamin.md', 'Regulamin Fazy BETA')}
                className="ml-2 text-primary hover:underline font-black uppercase tracking-widest text-[9px]"
              >
                [ OTWÓRZ DOKUMENT ]
              </button>
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-primary transition-all group">
          <input 
            type="checkbox" 
            checked={!!acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-slate-200 text-primary focus:ring-primary focus:ring-offset-2"
          />
          <div className="flex-1">
            <p className="text-xs font-black text-brand-dark uppercase tracking-tight">Akceptuję Politykę Prywatności i RODO</p>
            <p className="text-[10px] font-medium text-slate-400 mt-1 leading-relaxed">
              Zgadzam się na przetwarzanie danych operacyjnych w celu doskonalenia algorytmów AI.
              <button 
                type="button" 
                onClick={() => openModal('/legal/polityka.md', 'Polityka Prywatności i RODO')}
                className="ml-2 text-primary hover:underline font-black uppercase tracking-widest text-[9px]"
              >
                [ OTWÓRZ DOKUMENT ]
              </button>
            </p>
          </div>
        </label>
      </div>

      <LegalModal 
        isOpen={modalData.isOpen} 
        onClose={closeModal} 
        filePath={modalData.filePath} 
        title={modalData.title} 
      />
    </div>
  );
};
