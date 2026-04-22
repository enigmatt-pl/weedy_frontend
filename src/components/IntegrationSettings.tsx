import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlatformApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Save, Settings2, Loader2 } from 'lucide-react';

export const IntegrationSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, checkPlatformStatus, updateProfile } = useAuthStore();
  const { showToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [savingKeys, setSavingKeys] = useState(false);
  const [showDevMode, setShowDevMode] = useState(false);
  
  const [devKeys, setDevKeys] = useState({
    platform_client_id: user?.platform_client_id || '',
    platform_client_secret: '', // Don't show existing secret for security
    use_dev_mode: !!user?.platform_configured
  });

  useEffect(() => {
    if (searchParams.get('platform') === 'connected') {
      showToast('Konto Platform połączone pomyślnie!', 'success');
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('platform');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, showToast]);

  useEffect(() => {
    setDevKeys(prev => ({
      ...prev,
      platform_client_id: user?.platform_client_id || '',
      use_dev_mode: !!user?.platform_configured
    }));
  }, [user]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await PlatformApi.getAuthUrl();
      window.location.href = url;
    } catch {
      showToast('Błąd pobierania adresu autoryzacji', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setLoading(true);
    try {
      await checkPlatformStatus();
      showToast('Status połączenia odświeżony', 'success');
    } catch {
      showToast('Błąd pobierania statusu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = async () => {
    setSavingKeys(true);
    try {
      await updateProfile({
        platform_client_id: devKeys.platform_client_id,
        platform_client_secret: devKeys.platform_client_secret,
        platform_configured: devKeys.use_dev_mode
      });
      showToast('Klucze deweloperskie zapisane', 'success');
    } catch {
      showToast('Błąd zapisywania kluczy', 'error');
    } finally {
      setSavingKeys(false);
    }
  };

  const handleToggleDevMode = async (enabled: boolean) => {
    setDevKeys(prev => ({ ...prev, use_dev_mode: enabled }));
    if (!enabled) {
      // If disabling dev mode, we should notify the backend to use defaults
      try {
        await updateProfile({ platform_configured: false });
        showToast('System powrócił do trybu domyślnego', 'info');
      } catch {
        showToast('Błąd podczas zmiany trybu', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl overflow-hidden border-t-4 border-primary">
        <CardContent className="p-10 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-brand-dark text-white text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                <span className={`w-2 h-2 rounded-full ${user?.is_platform_connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {user?.is_platform_connected ? 'Połączenie Aktywne' : 'Brak Sygnału'}
              </div>
              <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-2">Most Platform</h3>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-sm">Autoryzuj bezpieczny hand-shake, aby umożliwić transfer danych operacyjnych.</p>
            </div>
            
            <div className="shrink-0 bg-slate-50 p-8 rounded-xl border border-slate-100 flex flex-col items-center gap-6 shadow-inner w-full md:w-auto min-w-[300px]">
              <img 
                src="/platform-logo.svg" 
                alt="Platform Logo" 
                className={`h-10 transition-all duration-700 ${user?.is_platform_connected ? 'grayscale-0 scale-110' : 'grayscale opacity-30 shadow-none'}`}
              />
              <Button 
                onClick={user?.is_platform_connected ? handleRefreshStatus : handleConnect}
                size="lg"
                variant={user?.is_platform_connected ? 'secondary' : 'primary'}
                disabled={loading}
                className="w-full shadow-lg"
              >
                {loading ? 'PRZETWARZANIE...' : user?.is_platform_connected ? 'ODŚWIEŻ POŁĄCZENIE' : 'POŁĄCZ Z ALLEGRO'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Mode Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <button 
          onClick={() => setShowDevMode(!showDevMode)}
          className="w-full px-10 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-dark/5 flex items-center justify-center">
               <Settings2 className="w-5 h-5 text-brand-dark" />
            </div>
            <div className="text-left">
              <h4 className="text-[11px] font-black text-brand-dark uppercase tracking-widest">Zaawansowane: Tryb Dewelopera</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Użyj własnej aplikacji Platform (Client ID / Secret)</p>
            </div>
          </div>
          {showDevMode ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showDevMode && (
          <div className="px-10 pb-10 space-y-8 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-emerald-50 border-l-4 border-primary p-6 rounded-r-xl space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h5 className="text-[10px] font-black text-primary uppercase tracking-widest">Industrial-Grade Security</h5>
              </div>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                Włączenie tego trybu pozwoli Ci korzystać z własnych limitów API. Twoje klucze są szyfrowane na serwerze (Rails Native GCM) i używane wyłącznie do autoryzacji Twojego konta.
              </p>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-4 cursor-pointer group w-fit">
                <div 
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${devKeys.use_dev_mode ? 'bg-primary' : 'bg-slate-200'}`}
                  onClick={() => handleToggleDevMode(!devKeys.use_dev_mode)}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${devKeys.use_dev_mode ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-xs font-black text-brand-dark uppercase tracking-widest">Użyj własnej aplikacji Platform</span>
              </label>

              {devKeys.use_dev_mode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in duration-500">
                  <Input 
                    label="Platform Client ID"
                    placeholder="Wprowadź Client ID"
                    value={devKeys.platform_client_id}
                    onChange={(e) => setDevKeys(prev => ({ ...prev, platform_client_id: e.target.value }))}
                  />
                  <Input 
                    label="Platform Client Secret"
                    type="password"
                    placeholder="••••••••••••••••"
                    value={devKeys.platform_client_secret}
                    onChange={(e) => setDevKeys(prev => ({ ...prev, platform_client_secret: e.target.value }))}
                  />
                  <div className="md:col-span-2">
                    <Button 
                      onClick={handleSaveKeys}
                      disabled={savingKeys || !devKeys.platform_client_id}
                      className="w-full md:w-auto"
                    >
                      {savingKeys ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      ZAPISZ KONFIGURACJĘ DEWELOPERA
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
               <Info className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
               <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                 Pamiętaj, aby w portalu dewelopera Platform dodać adres zwrotny (Callback URL): <br/>
                 <code className="text-primary font-black select-all">http://localhost:5173/dashboard/platform/callback</code>
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
