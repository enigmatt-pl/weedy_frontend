import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { UserCircle, ShieldCheck, Camera, Loader2, Globe } from 'lucide-react';
import { IntegrationSettings } from '../components/IntegrationSettings';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  last_name: z.string().min(2, 'Nazwisko musi mieć co najmniej 2 znaki'),
  city: z.string().min(2, 'Miasto jest wymagane'),
  postcode: z.string().regex(/^\d{2}-\d{3}$/, 'Nieprawidłowy format (00-000)'),
  province: z.string().min(2, 'Województwo jest wymagane'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { user, updateProfile, uploadAvatar } = useAuthStore();
  const { showToast } = useToastStore();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      city: user?.city || '',
      postcode: user?.postcode || '',
      province: user?.province || '',
    }
  });

  // Re-sync form if user state changes
  useEffect(() => {
    resetProfile({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      city: user?.city || '',
      postcode: user?.postcode || '',
      province: user?.province || '',
    });
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await updateProfile(data);
      showToast('Profil zaktualizowany pomyślnie', 'success');
    } catch {
      showToast('Błąd podczas aktualizacji profilu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Wybierz plik graficzny', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Rozmiar zdjęcia nie może przekraczać 2MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      showToast('Awatar zaktualizowany', 'success');
    } catch {
      showToast('Błąd podczas przesyłania awatara', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12 border-l-4 border-primary pl-6">
        <h1 className="text-4xl font-black text-brand-dark mb-1 uppercase tracking-tight">System Configuration</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Zarządzaj parametrami operacyjnymi i integracją</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar for settings tabs */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-3">
          <button
            id="settings-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded transition-all text-left group ${
              activeTab === 'profile'
                ? 'bg-primary text-white shadow-xl shadow-emerald-500/20'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            <UserCircle className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
            <span className="text-xs font-black uppercase tracking-widest">Profil Operatora</span>
          </button>
          
          <button
            id="settings-tab-integrations"
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded transition-all text-left group ${
              activeTab === 'integrations'
                ? 'bg-primary text-white shadow-xl shadow-emerald-500/20'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            <Globe className={`w-5 h-5 ${activeTab === 'integrations' ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} />
            <span className="text-xs font-black uppercase tracking-widest">Integracje</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-brand-dark px-10 py-5">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em]">Hardware ID / Dane Operatora</h2>
              </div>
              <CardContent className="p-10">
                <div className="mb-12 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-slate-100 flex items-center justify-center p-1 shadow-lg group-hover:border-primary transition-colors duration-500">
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-full" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                            <UserCircle className="w-16 h-12 text-slate-200" />
                          </div>
                        )}
                        
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-brand-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-emerald-600 transition-all shadow-xl border-4 border-white">
                      <Camera className="w-4 h-4" />
                      <input 
                        id="settings-avatar-input"
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6">Zaktualizuj profil wizualny</p>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      id="settings-first-name"
                      label="Imię"
                      placeholder="Jan"
                      error={profileErrors.first_name?.message}
                      {...registerProfile('first_name')}
                    />
                    <Input
                      id="settings-last-name"
                      label="Nazwisko"
                      placeholder="Kowalski"
                      error={profileErrors.last_name?.message}
                      {...registerProfile('last_name')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      id="settings-city"
                      label="System miasto"
                      placeholder="Warszawa"
                      error={profileErrors.city?.message}
                      {...registerProfile('city')}
                    />
                    <Input
                      id="settings-postcode"
                      label="Kryptonim pocztowy"
                      placeholder="00-001"
                      error={profileErrors.postcode?.message}
                      {...registerProfile('postcode')}
                    />
                  </div>

                  <Input
                    id="settings-province"
                    label="Region operacyjny"
                    placeholder="Mazowieckie"
                    error={profileErrors.province?.message}
                    {...registerProfile('province')}
                  />

                  <div className="bg-slate-50 p-6 rounded border-l-4 border-slate-200">
                    <Input
                      label="Stały Adres Email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-transparent border-none p-0 shadow-none text-slate-500 font-bold"
                    />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Nie można modyfikować nadrzędnego identyfikatora systemowego</p>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <Button id="settings-profile-submit" type="submit" size="lg" disabled={loading} className="w-full md:w-auto shadow-xl shadow-emerald-500/20">
                      {loading ? 'SYNCHRONIZACJA...' : 'ZAKTUALIZUJ BAZĘ DANYCH'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <div className="mb-0 flex items-center gap-3 border-l-4 border-brand-dark pl-6">
                <ShieldCheck className="w-6 h-6 text-brand-dark" />
                <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight">Protokół Bezpieczeństwa Platform</h2>
              </div>
              <IntegrationSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
