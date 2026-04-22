import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { ImageUpload } from './ImageUpload';
import { DispensariesApi } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const dispensarySchema = z.object({
  title: z.string().min(3, 'Nazwa punktu musi mieć co najmniej 3 znaki'),
  description: z.string().min(10, 'Opis musi mieć co najmniej 10 znaków'),
  query_data: z.string().min(5, 'Podaj adres punktu'),
  verification_id: z.string().optional(),
});

type DispensaryFormData = z.infer<typeof dispensarySchema>;

export const DispensaryWizard = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DispensaryFormData>({
    resolver: zodResolver(dispensarySchema),
  });

  const onSubmit = async (data: DispensaryFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('dispensary[title]', data.title);
      formData.append('dispensary[description]', data.description);
      formData.append('dispensary[query_data]', data.query_data);
      if (data.verification_id) {
        formData.append('dispensary[verification_id]', data.verification_id);
      }
      
      images.forEach((image) => {
        formData.append('dispensary[images][]', image);
      });

      await DispensariesApi.create(formData);
      showToast('Punkt został dodany pomyślnie!', 'success');
      navigate('/dashboard/history');
    } catch (error) {
      showToast('Wystąpił błąd podczas dodawania punktu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12 border-l-4 border-primary pl-6">
        <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight mb-2">Dodaj Nowy Punkt</h1>
        <p className="text-slate-400 font-medium tracking-wide">Wprowadź dane swojej placówki do sieci Weedy</p>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="flex-1 flex flex-col gap-2">
          <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-slate-100'}`} />
          <p className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-brand-dark' : 'text-slate-400'}`}>1. Media i Zdjęcia</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-slate-100'}`} />
          <p className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-brand-dark' : 'text-slate-400'}`}>2. Informacje o Punkcie</p>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          {step === 1 ? (
            <div className="p-8 md:p-12 space-y-8">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-2">
                   Zdjęcia placówki (opcjonalnie)
                </h3>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  onNext={() => setStep(2)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} className="px-10 py-6 rounded-2xl group">
                  Dalej
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <Store className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Podstawowe Dane</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Nazwa Punktu</label>
                        <input
                          {...register('title')}
                          className={`w-full bg-white border ${errors.title ? 'border-red-500' : 'border-slate-100'} rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                          placeholder="np. Green Life Katowice"
                        />
                        {errors.title && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">NIP / ID Weryfikacyjne</label>
                        <input
                          {...register('verification_id')}
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="opcjonalnie"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <MapPin className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Lokalizacja</span>
                    </div>
                    <Textarea
                      {...register('query_data')}
                      label=""
                      placeholder="Pełny adres punktu..."
                      error={errors.query_data?.message}
                      className="bg-white min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <FileText className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Opis i Szczegóły</span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <Textarea
                      {...register('description')}
                      label=""
                      placeholder="Opisz swój punkt, asortyment i godziny otwarcia..."
                      error={errors.description?.message}
                      className="bg-white flex-1 min-h-[250px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-slate-400 hover:text-brand-dark uppercase tracking-widest transition-colors"
                >
                  Powrót do zdjęć
                </button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-12 py-8 bg-brand-dark hover:bg-black rounded-2xl shadow-2xl shadow-black/20"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <CheckCircle2 className="mr-3 w-6 h-6" />
                      DODAJ PUNKT DO SIECI
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
