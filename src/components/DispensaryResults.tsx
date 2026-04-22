import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { DispensariesApi, GenerateDispensaryResponse, Dispensary } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { Save, Send, Loader2, Settings as SettingsIcon, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SyncWizard } from './SyncWizard';

const resultsSchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  description: z.string().min(1, 'Opis jest wymagany'),
  estimated_price: z.number().min(0.01, 'Cena musi być większa niż 0'),
});

type ResultsFormData = z.infer<typeof resultsSchema>;

interface DispensaryResultsProps {
  results: GenerateDispensaryResponse;
  onReset: () => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

export const DispensaryResults = ({
  results,
  onReset,
  onRegenerate,
  isGenerating = false,
}: DispensaryResultsProps) => {
  const [saving, setSaving] = useState(false);
  const { showToast } = useToastStore();
  const { user, role } = useAuthStore();
  const [showPublishWizard, setShowPublishWizard] = useState(false);
  const [savedDispensary, setSavedDispensary] = useState<Dispensary | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  // If we are generating, we should probably disable interaction or show a global loader.
  // The user wants to freeze buttons.

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultsFormData>({
    resolver: zodResolver(resultsSchema),
    values: {
      title: results.title || '',
      description: results.description || '',
      estimated_price: Number(results.estimated_price) || 0,
    },
  });

  // Fetch the full dispensary data to ensure we have the correct image_urls
  useEffect(() => {
    const fetchFullDispensary = async () => {
      try {
        const fullDispensary = await DispensariesApi.getOne(results.id);
        setSavedDispensary(fullDispensary);
      } catch (error) {
        console.error('Failed to fetch full dispensary details:', error);
      }
    };
    if (results.id) {
      fetchFullDispensary();
    }
  }, [results.id]);

  const handleSave = async (payloadData: ResultsFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { data } = await DispensariesApi.update(results.id, {
        title: payloadData.title,
        description: payloadData.description,
        estimated_price: payloadData.estimated_price,
        status: 'draft',
        image_urls: ((savedDispensary as Dispensary | null)?.image_urls || results.image_urls || []).filter((url: unknown): url is string => typeof url === 'string')
      });
      const updatedDispensary = data.dispensary || data;
      setSavedDispensary(updatedDispensary);
      showToast('Oferta została pomyślnie zapisana', 'success');
    } catch {
      showToast('Błąd zapisu szkicu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePushToPlatform = async (payloadData: ResultsFormData) => {
    if (!user) return;

    if (!user.is_platform_connected) {
      showToast(
        (
          <div className="flex flex-col gap-2">
            <p>Najpierw połącz konto Platform w ustawieniach.</p>
            <Link to="/dashboard/settings" className="flex items-center gap-1 text-xs font-bold underline">
              <SettingsIcon className="w-3 h-3" /> Przejdź do ustawień
            </Link>
          </div>
        ) as unknown as string,
        'error'
      );
      return;
    }

    if (!savedDispensary) {
      setSaving(true);
      try {
        const { data: response } = await DispensariesApi.update(results.id, {
          title: payloadData.title,
          description: payloadData.description,
          estimated_price: payloadData.estimated_price,
          status: 'draft',
          image_urls: ((savedDispensary as Dispensary | null)?.image_urls || results.image_urls || []).filter((url: unknown): url is string => typeof url === 'string')
        });
        const updatedDispensary = response.dispensary || response;
        setSavedDispensary(updatedDispensary);
        setShowPublishWizard(true);
      } catch {
        showToast('Wystąpił błąd podczas przygotowania oferty', 'error');
      } finally {
        setSaving(false);
      }
    } else {
      setShowPublishWizard(true);
    }
  };

  if (showPublishWizard && savedDispensary) {
    return (
      <SyncWizard 
        dispensary={savedDispensary} 
        onComplete={onReset} 
        onCancel={() => setShowPublishWizard(false)} 
      />
    );
  }

  const isBusy = saving || isGenerating;

  return (
    <div className={`space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isGenerating ? 'opacity-70 pointer-events-none cursor-wait' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 rounded-[2rem] px-6 md:px-10 py-6 md:py-8 shadow-xl shadow-slate-200/50 gap-6 relative overflow-hidden">
        {isGenerating && (
           <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/5">
              <div className="h-full bg-primary animate-progress" style={{ width: '40%' }}></div>
           </div>
        )}
        <div className="flex items-center gap-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isGenerating ? 'bg-primary/5 animate-pulse' : 'bg-emerald-50'}`}>
            <BrainCircuit className={`w-6 h-6 ${isGenerating ? 'text-primary' : 'text-emerald-600'}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Status Analizy</p>
            <p className="text-sm text-slate-900 font-bold tracking-tight">
              {isGenerating ? 'Trwa przetwarzanie danych...' : 'Wizytówka gotowa do edycji'}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right flex flex-col items-start sm:items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">Sugerowana cena (PLN)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              disabled={isBusy}
              {...register('estimated_price', { valueAsNumber: true })}
              className="bg-transparent border-b border-primary/30 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight w-24 text-center outline-none focus:border-primary transition-colors"
            />
            <span className="text-sm text-slate-400 font-bold">PLN</span>
          </div>
        </div>
      </div>
      
      {results.reasoning && role === 'super_admin' && (
        <div className="bg-slate-50 border-l-4 border-primary/30 p-2 md:p-4 rounded-r-xl shadow-inner animate-in fade-in slide-in-from-left duration-700">
           <button
             type="button"
             disabled={isBusy}
             onClick={() => setShowReasoning(!showReasoning)}
             className="flex items-center justify-between w-full px-4 py-2 hover:bg-slate-100/50 rounded-lg transition-colors group"
           >
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <BrainCircuit className={`w-5 h-5 transition-colors ${showReasoning ? 'text-primary' : 'text-slate-400'}`} />
               </div>
               <p className="text-[10px] font-bold tracking-wide text-slate-400 group-hover:text-slate-600 transition-colors">Analiza Techniczna AI (Reasoning)</p>
             </div>
             {showReasoning ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
           </button>
           
           {showReasoning && (
             <div className="px-4 py-6 animate-in slide-in-from-top-2 duration-300">
               <p className="text-xs font-medium text-slate-600 leading-relaxed  whitespace-pre-wrap font-mono border-t border-slate-200/60 pt-6">
                 "{results.reasoning}"
               </p>
             </div>
           )}
        </div>
      )}

      <form className="space-y-6 md:space-y-8 bg-white p-6 md:p-8 rounded border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <Textarea
          label="Tytuł ogłoszenia"
          placeholder="Wprowadź tytuł oferty"
          rows={2}
          error={errors.title?.message}
          disabled={isBusy}
          {...register('title')}
          className="text-lg font-bold"
        />

        <Textarea
          label="Opis punktu"
          placeholder="Wprowadź opis oferty"
          rows={8}
          error={errors.description?.message}
          disabled={isBusy}
          {...register('description')}
        />

        <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-slate-100 mt-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(handleSave)}
            disabled={isBusy}
            className="w-full md:w-auto md:min-w-[200px]"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Zapisz zmiany</>
            )}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(handlePushToPlatform)}
            disabled={isBusy}
            className="flex-1 w-full md:w-auto shadow-xl shadow-emerald-500/20"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transfer...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Publikuj w Sieci</>
            )}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onRegenerate}
            disabled={isBusy}
            className={`flex-1 py-4 text-xs font-semibold transition-all border border-transparent rounded-2xl flex items-center justify-center gap-3
              ${isGenerating 
                ? 'text-primary border-primary animate-pulse' 
                : 'text-primary hover:bg-emerald-50'
              }`}
          >
            {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGenerating ? 'Trwa generowanie...' : 'Generuj ponownie'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={isBusy}
            className="flex-1 py-4 text-xs font-semibold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-30"
          >
            Dodaj kolejny punkt
          </Button>
        </div>
      </form>
    </div>
  );
};
