import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/ui/Logo';
import { AlertCircle, ShieldCheck, Zap, Globe } from 'lucide-react';
import { LegalModal } from '../components/LegalModal';

const registerSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  first_name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  last_name: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  confirmPassword: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  acceptTerms: z.boolean().refine(v => v === true, { message: 'Musisz zaakceptować regulamin' }),
  acceptPrivacy: z.boolean().refine(v => v === true, { message: 'Musisz zaakceptować politykę prywatności' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState<{ isOpen: boolean; filePath: string; title: string }>({
    isOpen: false,
    filePath: '',
    title: '',
  });
  
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  const { showToast } = useToastStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        accept_terms: new Date().toISOString(),
        accept_privacy: new Date().toISOString()
      });
      showToast('Konto zostało pomyślnie utworzone', 'success');
      navigate('/dashboard');
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string, message?: string } } };
      const responseData = axiosError.response?.data;
      const errorMessage = typeof responseData === 'string' ? responseData : responseData?.error || responseData?.message || '';
      showToast(errorMessage || 'Rejestracja nie powiodła się', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isLegalAccepted = watch('acceptTerms') && watch('acceptPrivacy');

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Visual Side (Fixed on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10 scale-125 origin-left">
          <Logo variant="light" size="lg" />
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-white  tracking-tight leading-none">
              REKRUTACJA <br/> OPERATORA
            </h2>
            <div className="h-1 w-24 bg-primary rounded-full"></div>
            <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
              Zyskaj dostęp do zaawansowanego terminala Weedy i zlokalizuj najbliższe punkty w czasie rzeczywistym.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs tracking-wide">Bezpieczeństwo</h4>
                <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-tight">Protokół JWT & SSL</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs tracking-wide">Wydajność</h4>
                <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-tight">Sidekiq Asynchronic</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-xs tracking-wide">Skalowanie</h4>
                <p className="text-slate-500 text-[10px] mt-1 uppercase font-bold tracking-tight">Multi-account</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold tracking-wider text-slate-500 border-t border-white/5 pt-8">
           <span>© 2026 WEEDY</span>
           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
           <span>Terminal v2.4.0</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 max-w-2xl mx-auto w-full">
          
          <div className="lg:hidden mb-12 text-center">
            <div className="flex items-center justify-center mb-6 bg-brand-dark p-6 rounded-xl shadow-xl">
               <Logo variant="light" size="lg" />
            </div>
          </div>

          <div className="w-full space-y-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 tracking-tight uppercase ">
                Inicjalizacja Konta
              </h1>
              <p className="text-xs font-bold text-slate-400 tracking-wider">Zarejestruj się, aby uzyskać dostęp do terminala</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="register-first-name"
                  label="Imię Użytkownika"
                  placeholder="np. Jan"
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />
                <Input
                  id="register-last-name"
                  label="Nazwisko Użytkownika"
                  placeholder="np. Kowalski"
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />
              </div>

              <Input
                id="register-email"
                type="email"
                label="Kanał Komunikacji (Email)"
                placeholder="operator@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="register-password"
                  type="password"
                  label="Hasło Dostępu"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  id="register-confirm-password"
                  type="password"
                  label="Weryfikacja Hasła"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-inner">
                <div className="flex items-center gap-3 border-l-2 border-primary pl-4 mb-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <h4 className="text-[10px] font-bold tracking-wider text-slate-500">Zgody Prawne</h4>
                </div>

                <label className="flex items-start gap-4 cursor-pointer group">
                  <input 
                    id="register-accept-terms"
                    type="checkbox" 
                    {...register('acceptTerms')}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary transition-colors"
                  />
                  <span className="text-[11px] font-medium text-slate-600 leading-relaxed">
                    Akceptuję <button id="register-view-terms-btn" type="button" onClick={() => setModalData({ isOpen: true, filePath: '/legal/regulamin.md', title: 'Regulamin' })} className="text-primary font-bold underline hover:text-emerald-700">Regulamin Fazy BETA</button>
                    {errors.acceptTerms && <p className="text-red-500 font-bold mt-1 uppercase text-[9px]">{errors.acceptTerms.message}</p>}
                  </span>
                </label>

                <label className="flex items-start gap-4 cursor-pointer group">
                  <input 
                    id="register-accept-privacy"
                    type="checkbox" 
                    {...register('acceptPrivacy')}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary transition-colors"
                  />
                  <span className="text-[11px] font-medium text-slate-600 leading-relaxed">
                    Akceptuję <button id="register-view-privacy-btn" type="button" onClick={() => setModalData({ isOpen: true, filePath: '/legal/polityka.md', title: 'Polityka Prywatności' })} className="text-primary font-bold underline hover:text-emerald-700">Politykę Prywatności</button>
                    {errors.acceptPrivacy && <p className="text-red-500 font-bold mt-1 uppercase text-[9px]">{errors.acceptPrivacy.message}</p>}
                  </span>
                </label>
              </div>

              <div className="space-y-6 pt-4">
                <Button
                  id="register-submit-btn"
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={loading || !isLegalAccepted}
                  className={`py-6 text-sm ${isLegalAccepted ? 'shadow-2xl shadow-emerald-500/20' : 'opacity-40 grayscale pointer-events-none'}`}
                >
                  {loading ? 'PRZETWARZANIE...' : 'UTWÓRZ PROFIL UŻYTKOWNIKA'}
                </Button>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 tracking-wide">
                    Posiadasz już dostęp? {' '}
                    <Link id="register-login-link" to="/login" className="text-primary hover:text-emerald-700 font-bold transition-colors">
                      [ ZALOGUJ SIĘ ]
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <LegalModal 
        isOpen={modalData.isOpen} 
        onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))} 
        filePath={modalData.filePath} 
        title={modalData.title} 
      />
    </div>
  );
};
