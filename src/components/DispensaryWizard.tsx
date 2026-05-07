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
import { Store, MapPin, FileText, CheckCircle2, Loader2, ArrowRight, Navigation, Clock } from 'lucide-react';
import { LocationPicker } from './LocationPicker';

const dispensarySchema = z.object({
  title: z.string().min(3, 'Nazwa punktu musi mieć co najmniej 3 znaki'),
  description: z.string().min(10, 'Opis musi mieć co najmniej 10 znaków'),
  query_data: z.string().min(5, 'Podaj adres punktu'),
  city: z.string().min(2, 'Podaj miasto'),
  categories: z.array(z.string()).min(1, 'Wybierz co najmniej jedną kategorię'),
  verification_id: z.string().optional(),
  latitude: z.union([z.string(), z.number()]).optional().transform(v => typeof v === 'string' ? parseFloat(v) : v),
  longitude: z.union([z.string(), z.number()]).optional().transform(v => typeof v === 'string' ? parseFloat(v) : v),
  phone: z.string().optional(),
  email: z.string().email('Niepoprawny email').optional().or(z.literal('')),
  website: z.string().url('Niepoprawny adres URL').optional().or(z.literal('')),
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
    watch,
    setValue,
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
      formData.append('dispensary[city]', data.city);
      data.categories.forEach(cat => {
        formData.append('dispensary[categories][]', cat);
      });
      if (data.verification_id) {
        formData.append('dispensary[verification_id]', data.verification_id);
      }
      if (data.latitude) {
        formData.append('dispensary[latitude]', data.latitude.toString());
      }
      if (data.longitude) {
        formData.append('dispensary[longitude]', data.longitude.toString());
      }
      if (data.phone) {
        formData.append('dispensary[phone]', data.phone);
      }
      if (data.email) {
        formData.append('dispensary[email]', data.email);
      }
      if (data.website) {
        formData.append('dispensary[website]', data.website);
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
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Identity & Details */}
                <div className="lg:col-span-7 space-y-10">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-primary">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest leading-none">Tożsamość Punktu</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nazwa i Klasyfikacja</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Nazwa placówki</label>
                        <input
                          {...register('title')}
                          className={`w-full bg-slate-50/50 border ${errors.title ? 'border-red-500' : 'border-slate-100'} rounded-[1.25rem] px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                          placeholder="np. Premium Buds Katowice"
                        />
                        {errors.title && <p className="mt-2 text-[10px] text-red-500 font-bold px-1">{errors.title.message}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 px-1">Kategorie (wybierz wiele)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['cbd', 'hemp', 'medical', 'accessories'].map((cat) => (
                            <label
                              key={cat}
                              className={`flex items-center justify-center px-4 py-4 rounded-[1.25rem] border-2 cursor-pointer transition-all duration-300 ${
                                (watch('categories') || []).includes(cat)
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                  : 'bg-slate-50/50 border-transparent text-slate-500 hover:border-slate-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                value={cat}
                                {...register('categories')}
                              />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {cat === 'cbd' ? 'CBD' : cat === 'hemp' ? 'Konopie' : cat === 'medical' ? 'Medyczna' : 'Akcesoria'}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.categories && <p className="mt-2 text-[10px] text-red-500 font-bold px-1">{errors.categories.message}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Opis Punktu</label>
                        <Textarea
                          {...register('description')}
                          label=""
                          placeholder="Opisz swoją ofertę, klimat i specjalizację..."
                          error={errors.description?.message}
                          className="bg-slate-50/50 min-h-[220px] rounded-[1.25rem] border-none focus:bg-white p-6"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-5 space-y-10">
                  <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest leading-none">Lokalizacja</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Zaznacz na mapie</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Miasto</label>
                          <input
                            {...register('city')}
                            className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="np. Warszawa"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Adres Pełny</label>
                          <input
                            {...register('query_data')}
                            className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            placeholder="ul. Zielona 4/2..."
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <LocationPicker 
                          lat={watch('latitude')} 
                          lng={watch('longitude')} 
                          onChange={(lat, lng) => {
                            setValue('latitude', lat);
                            setValue('longitude', lng);
                          }}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100/50">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest leading-none">Kontakt i Firmowe</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dane biznesowe</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input
                        {...register('phone')}
                        placeholder="Numer telefonu"
                        className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <input
                        {...register('email')}
                        placeholder="Adres E-mail"
                        className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <input
                        {...register('verification_id')}
                        placeholder="NIP / REGON"
                        className="w-full bg-white border border-slate-100 rounded-xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </section>
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
