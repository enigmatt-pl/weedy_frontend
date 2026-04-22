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
import { ShieldAlert, Key } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const { showToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      showToast('Pomyślnie zalogowano', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Logowanie nie powiodło się',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-dark relative flex-col justify-between p-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="relative z-10 scale-125 origin-left animate-in slide-in-from-left duration-700">
          <Logo variant="light" size="lg" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-white  tracking-tight leading-none">
              TERMINAL <br/> DOSTĘPU
            </h2>
            <div className="h-1 w-24 bg-primary rounded-full"></div>
            <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed">
              Weryfikacja tożsamości. Zaloguj się, aby zarządzać swoimi punktami i analizować dane w czasie rzeczywistym.
            </p>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold tracking-wider">
                <ShieldAlert className="w-4 h-4 text-primary" />
                 Szyfrowanie End-to-End
             </div>
             <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold tracking-wider">
                <Key className="w-4 h-4 text-primary" />
                 Zarządzanie kredytami
             </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[10px] font-bold tracking-wider text-slate-500 border-t border-white/5 pt-8">
           <span>SESJA: WEEDY_SECURE</span>
           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
           <span>v2.4.0</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 max-w-xl mx-auto w-full">
          
          <div className="lg:hidden mb-12 text-center w-full">
            <div className="flex items-center justify-center mb-6 bg-brand-dark p-6 rounded-xl shadow-xl">
               <Logo variant="light" size="lg" />
            </div>
          </div>

          <div className="w-full space-y-12">
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 tracking-tight uppercase ">
                Inicjalizacja Sesji
              </h1>
              <p className="text-xs font-bold text-slate-400 tracking-wider">Zaloguj się, aby uzyskać dostęp do panelu</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in delay-200 fade-in duration-700">
              <div className="space-y-6">
                <Input
                  id="login-email"
                  type="email"
                  label="Identyfikator (Email)"
                  placeholder="operator@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  id="login-password"
                  type="password"
                  label="Klucz Dostępu (Hasło)"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>

              <div className="space-y-6 pt-4">
                <Button
                  id="login-submit-btn"
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={loading}
                  className="py-6 text-sm shadow-2xl shadow-emerald-500/20"
                >
                  {loading ? 'PRZETWARZANIE...' : 'INICJUJ LOGOWANIE'}
                </Button>

                <div className="text-center pt-8 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 tracking-wide leading-relaxed">
                    Brak autoryzacji w systemie? <br className="md:hidden"/>
                    <Link id="login-register-link" to="/register" className="text-primary hover:text-emerald-700 font-bold transition-colors">
                      [ UTWÓRZ PROFIL ]
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
