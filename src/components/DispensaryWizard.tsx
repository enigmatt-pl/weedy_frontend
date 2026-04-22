import { useState } from 'react';
import { Card } from './ui/Card';
import { ImageUpload } from './ImageUpload';
import { ReferenceInput } from './ReferenceInput';
import { DispensaryResults } from './DispensaryResults';
import { DispensariesApi, GenerateDispensaryResponse } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { Check } from 'lucide-react';

type WizardStep = 1 | 2 | 3;

export const DispensaryWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [images, setImages] = useState<File[]>([]);
  const [queryData, setQueryData] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerateDispensaryResponse | null>(null);
  const { showToast } = useToastStore();
  const { user, setCredits } = useAuthStore();

  const handleImagesChange = (files: File[]) => {
    setImages(files);
  };

  const handleQueryDataSubmit = (value: string) => {
    setQueryData(value);
  };

  const handleGenerate = async (submittedQueryData?: string) => {
    const finalQueryData = submittedQueryData || queryData;

    if (!finalQueryData) {
      showToast('Proszę wprowadzić dane punktu', 'error');
      return;
    }

    if (user && user.credits <= 0) {
      showToast('Brak dostępnych kredytów. Skontaktuj się z administratorem.', 'error');
      return;
    }

    setLoading(true);
    try {
      const initialResponse = await DispensariesApi.generate(finalQueryData, images);
      setCredits(initialResponse.credits_remaining);

      // Polling logic
      const poll = async () => {
        try {
          console.log(`Polling status for dispensary ${initialResponse.id}...`);
          const dispensary = await DispensariesApi.getOne(initialResponse.id);
          console.log(`Current status: ${dispensary.status}`);

          if (dispensary.status !== 'generating') {
            setResults({
              ...dispensary,
              credits_remaining: initialResponse.credits_remaining,
            });
            setCurrentStep(3);
            setLoading(false);
            showToast('Oferta została pomyślnie wygenerowana', 'success');
          } else {
            setTimeout(poll, 3000);
          }
        } catch (error: unknown) {
          const axiosError = error as { response?: { data?: { errors?: string[] | string, error?: string } } };
          setLoading(false);
          const responseData = axiosError.response?.data;
          const backendMessage = responseData?.error || (Array.isArray(responseData?.errors) ? responseData.errors[0] : responseData?.errors);
          
          showToast(
            backendMessage || (error instanceof Error ? error.message : 'Nie udało się pobrać statusu generowania'),
            'error'
          );
        }
      };

      // Start polling
      poll();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: string[] | string, error?: string } } };
      setLoading(false);
      const responseData = axiosError.response?.data;
      const backendMessage = responseData?.error || (Array.isArray(responseData?.errors) ? responseData.errors[0] : responseData?.errors);
      
      showToast(
        backendMessage || (error instanceof Error ? error.message : 'Nie udało się zainicjować generowania oferty'),
        'error'
      );
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setImages([]);
    setQueryData('');
    setResults(null);
  };

  const steps = [
    { number: 1, title: 'Wgraj zdjęcia punktu' },
    { number: 2, title: 'Opis i lokalizacja' },
    { number: 3, title: 'Podgląd wizytówki' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 md:mb-12 border-l-4 border-primary/20 pl-4 md:pl-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-brand-dark mb-1 tracking-tight">
          Generator Wizytówek
        </h1>
        <p className="text-slate-400 font-medium tracking-wide text-xs md:text-sm">
          Przygotuj profesjonalną ofertę Twojego punktu w kilku krokach
        </p>
      </div>

      <div className="flex items-center gap-4 mb-12 md:mb-16">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col gap-3 flex-1">
            <div
              className={`h-2 w-full rounded-full transition-all duration-700 ${currentStep >= step.number
                  ? 'bg-primary shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-100'
                }`}
            />
            <div className="flex items-center gap-2">
              <span className={`text-[10px] md:text-[11px] font-bold tracking-widest uppercase ${currentStep >= step.number ? 'text-brand-dark' : 'text-slate-400'
                }`}>
                {step.number}. <span className="hidden md:inline">{step.title}</span>
              </span>
              {currentStep > step.number && (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Card className="border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden rounded-[2.5rem]">
        <div className="bg-slate-50/50 border-b border-slate-100 px-6 md:px-10 py-6 flex items-center justify-between">
          <h2 className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
            {steps[currentStep - 1].title}
          </h2>
          <div className="flex gap-1.5">
            <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary/20' : 'bg-slate-200'}`}></div>
            <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary/40' : 'bg-slate-200'}`}></div>
            <div className={`w-2 h-2 rounded-full transition-colors ${currentStep >= 3 ? 'bg-primary' : 'bg-slate-200'}`}></div>
          </div>
        </div>
        <div className="p-6 md:p-12">
          {currentStep === 1 && (
            <ImageUpload
              images={images}
              onImagesChange={handleImagesChange}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <ReferenceInput
              value={queryData}
              onChange={handleQueryDataSubmit}
              onBack={() => setCurrentStep(1)}
              onGenerate={handleGenerate}
              loading={loading}
            />
          )}

          {currentStep === 3 && results && (
            <DispensaryResults
              results={results}
              onReset={resetWizard}
              onRegenerate={() => handleGenerate(queryData)}
              isGenerating={loading}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
