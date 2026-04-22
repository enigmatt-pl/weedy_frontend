import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent } from '../components/ui/Card';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export const PlatformCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Finalizowanie autoryzacji z systemem Platform...');
  const navigate = useNavigate();
  const { showToast } = useToastStore();
  const { checkPlatformStatus } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      if (!code) {
        setStatus('error');
        setMessage('Brak kodu autoryzacyjnego w odpowiedzi Platform.');
        return;
      }

      try {
        await apiClient.post('/platform_integration/callback', { code });
        await checkPlatformStatus();
        setStatus('success');
        setMessage('Autoryzacja zakończona sukcesem. Twój terminal jest gotowy do pracy.');
        showToast('Konto Platform połączone pomyślnie!', 'success');
        setTimeout(() => navigate('/dashboard/settings'), 3000);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { error?: string } } };
        setStatus('error');
        setMessage(axiosError.response?.data?.error || 'Wystąpił błąd podczas finalizowania połączenia.');
        showToast('Błąd autoryzacji Platform', 'error');
      }
    };

    handleCallback();
  }, [searchParams, navigate, showToast, checkPlatformStatus]);

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-6">
      <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden">
        <div className="bg-brand-dark p-6 border-b-4 border-primary">
          <h2 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Protokół Autoryzacji Platform</h2>
        </div>
        <CardContent className="p-10 flex flex-col items-center text-center">
          {status === 'processing' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping opacity-20" />
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-xl border-2 border-green-100">
                <ShieldCheck className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-black text-brand-dark uppercase italic tracking-tight">POŁĄCZENIE NAWIĄZANE</h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest">{message}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-8 italic">Automatyczne przekierowanie za 3 sekundy...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-xl border-2 border-red-100">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-red-600 uppercase italic tracking-tight">BŁĄD SYSTEMU</h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest">{message}</p>
              <button 
                onClick={() => navigate('/dashboard/settings')}
                className="mt-8 text-[10px] font-black text-primary hover:text-emerald-700 uppercase tracking-widest"
              >
                [ POWRÓT DO USTAWIEŃ ]
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
