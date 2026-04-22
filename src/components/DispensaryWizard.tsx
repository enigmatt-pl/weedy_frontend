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
      <div className="mb-8 md:mb-12 border-l-4 border-primary pl-4 md:pl-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-brand-dark mb-1 uppercase tracking-tight">
          System Generation Engine
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[11px]">
          Postępuj zgodnie z protokołem, aby przygotować ofertę
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8 md:mb-10">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col gap-2 flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ${currentStep >= step.number
                    ? 'bg-primary shadow-[0_0_10px_rgba(234,88,12,0.5)]'
                    : 'bg-slate-200'
                  }`}
              />
              <div className="flex items-center gap-2">
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${currentStep >= step.number ? 'text-brand-dark' : 'text-slate-400'
                  }`}>
                  {step.number < 10 ? `0${step.number}` : step.number}. <span className="hidden md:inline">{step.title}</span>
                </span>
                {currentStep > step.number && (
                  <Check className="w-3 h-3 text-green-600 hidden md:block" />
                )}
              </div>
            </div>
            {index < steps.length - 1 && <div className="w-2 md:w-4" />}
          </div>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden rounded-lg">
        <div className="bg-brand-dark px-6 md:px-10 py-5 flex items-center justify-between">
          <h2 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">
            Panel Operacyjny / {steps[currentStep - 1].title}
          </h2>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          </div>
        </div>
        <div className="p-6 md:p-10">
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
