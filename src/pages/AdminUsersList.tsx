import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../store/toastStore';
import { 
  Users, 
  Clock, 
  Mail, 
  CheckCircle2, 
  UserCircle, 
  Loader2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  UserX,
  Lock,
  Plus,
  Minus,
  Trash,
  Coins,
  X,
  Save
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'super_admin';
  approved: boolean;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  created_at: string;
  avatar_url_static?: string;
  credits: number;
}

interface Meta {
  current_page: number;
  total_pages: number;
  total_count: number;
}

export const AdminUsersList = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editCredits, setEditCredits] = useState<string>('0');
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (page: number, query: string) => {
    setLoading(true);
    try {
      const { data } = await AdminApi.getUsers(page, query);
      if (Array.isArray(data)) {
        setUsers(data);
        setMeta(null);
      } else {
        setUsers(data.users || []);
        setMeta(data.meta || null);
      }
    } catch {
      showToast('Błąd pobierania bazy operatorów', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(currentPage, searchTerm);
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers, currentPage, searchTerm]);

  useEffect(() => {
    if (selectedUser) {
      setEditCredits((selectedUser.credits ?? 0).toString());
    }
  }, [selectedUser]);

  const handleApprove = async (id: string) => {
    try {
      await AdminApi.approveUser(id);
      showToast('Operator został zatwierdzony', 'success');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, approved: true } : u));
    } catch {
      showToast('Błąd autoryzacji operatora', 'error');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz zawiesić dostęp temu operatorowi?')) return;
    
    try {
      await AdminApi.revokeUser(id);
      showToast('Dostęp został zawieszony', 'warning');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, approved: false } : u));
    } catch {
       showToast('Błąd podczas zawieszania dostępu', 'error');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz odrzucić tego operatora? Konto zostanie usunięte z systemu.')) return;
    
    try {
      await AdminApi.rejectUser(id);
      showToast('Dostęp został odrzucony', 'info');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      showToast('Błąd podczas odrzucania operatora', 'error');
    }
  };

  const handleUpdateCredits = async (id: string, newCredits: number) => {
    try {
      await AdminApi.updateCredits(id, newCredits);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, credits: newCredits } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, credits: newCredits } : null);
      }
      showToast('Kredyty zostały zaktualizowane', 'success');
    } catch {
      showToast('Błąd aktualizacji kredytów', 'error');
    }
  };

  const handleFullDelete = async (id: string) => {
    if (!window.confirm('OSTATECZNE OSTRZEŻENIE: Czy na pewno chcesz CAŁKOWICIE usunąć tego użytkownika i wszystkie jego dane z bazy? Tej operacji nie da się cofnąć.')) return;
    
    try {
      await AdminApi.deleteUser(id);
      showToast('Użytkownik został trwale usunięty', 'warning');
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelectedUser(null);
    } catch {
      showToast('Błąd krytyczny usuwania', 'error');
    }
  };

  const currentMeta = meta || {
    current_page: currentPage,
    total_pages: 1,
    total_count: users.length
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8 border-l-4 border-primary pl-6">
        <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tighter flex items-center gap-4">
          <Users className="w-10 h-10 text-primary" />
          Operatorzy
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Terminal Systemowy RBAC</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Szukaj..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <Filter className="w-4 h-4" />
           {loading ? 'Sinc...' : `Znaleziono: ${currentMeta.total_count}`}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizacja...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 whitespace-nowrap">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Operator</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Clearance</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Prywatność</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Kredyty</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Data</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Akcje RBAC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap ${!user.approved ? 'bg-emerald-50/10' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden ${user.approved ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-emerald-500'}`}>
                        {user.avatar_url_static ? (
                          <img src={user.avatar_url_static} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-7 h-7" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-brand-dark uppercase tracking-tight italic truncate max-w-[150px]">
                          {user.first_name} {user.last_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                       <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${user.role === 'super_admin' ? 'bg-brand-dark text-white' : 'bg-slate-200 text-slate-600'}`}>
                         {user.role}
                       </span>
                       <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${user.approved ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-emerald-500 animate-pulse'}`} />
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                           {user.approved ? 'Aktywny' : 'Oczekuje'}
                         </span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-2.5 h-2.5 ${user.accepted_terms_at ? 'text-green-600' : 'text-slate-200'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Terms</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-2.5 h-2.5 ${user.accepted_privacy_at ? 'text-green-600' : 'text-slate-200'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">Privacy</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <Coins className="w-3.5 h-3.5 text-primary" />
                       <span className="text-sm font-black text-brand-dark">{user.credits ?? 0}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {new Date(user.created_at).toLocaleDateString()}
                     </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.approved ? (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRevoke(user.id)} 
                          className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-900 text-[10px] uppercase font-black"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" /> ZAWIEŚ
                        </Button>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleReject(user.id)} 
                            className="h-8 px-2 text-red-500 hover:text-white hover:bg-red-500 text-[10px] uppercase font-black"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" /> ODRZUĆ
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(user.id)} 
                            className="h-8 px-4 shadow-lg shadow-emerald-500/10 text-[10px] uppercase font-black"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ZATWIERDŹ
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentMeta.total_pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strona</span>
              <input 
                type="number" 
                min={1} 
                max={currentMeta.total_pages} 
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= currentMeta.total_pages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-12 h-8 text-center bg-white border-2 border-slate-200 rounded-lg text-xs font-black text-brand-dark focus:border-primary outline-none transition-all"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">z {currentMeta.total_pages}</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setCurrentPage(currentMeta.current_page - 1)} 
                disabled={currentMeta.current_page === 1 || loading}
                className="px-4 h-8 text-[10px]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setCurrentPage(currentMeta.current_page + 1)} 
                disabled={currentMeta.current_page === currentMeta.total_pages || loading}
                className="px-4 h-8 text-[10px]"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DETALE OPERATORA / SIDE PANEL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-4xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="sticky top-0 bg-brand-dark p-8 flex items-center justify-between z-10 border-b-8 border-primary">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center p-1 border border-white/20">
                   {selectedUser.avatar_url_static ? (
                     <img src={selectedUser.avatar_url_static} alt="" className="w-full h-full object-cover rounded-xl" />
                   ) : (
                     <UserCircle className="w-10 h-10 text-white/40" />
                   )}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                     {selectedUser.first_name} {selectedUser.last_name}
                   </h2>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Operator ID: {selectedUser.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <section>
                <Button 
                  fullWidth 
                  variant="secondary"
                  onClick={() => navigate(`/dashboard/listings?userId=${selectedUser.id}`)}
                  className="bg-brand-dark text-white border-2 border-primary/20 hover:bg-slate-900 shadow-xl"
                >
                  <Clock className="w-4 h-4 mr-2 text-primary" /> PRZEJRZYJ HISTORIĘ OFERT
                </Button>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <Coins className="w-3 h-3 text-primary" /> Zarządzanie Kredytami
                </h3>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Aktualnie dostępne</p>
                    <p className="text-6xl font-black text-brand-dark tracking-tighter italic">{selectedUser.credits ?? 0}</p>
                  </div>
                  
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="secondary" 
                        fullWidth 
                        className="bg-white border-2 border-slate-200" 
                        onClick={() => handleUpdateCredits(selectedUser.id, Math.max(0, (selectedUser.credits ?? 0) - 10))}
                      >
                        <Minus className="w-4 h-4 mr-2" /> -10
                      </Button>
                      <Button 
                        variant="primary" 
                        fullWidth 
                        onClick={() => handleUpdateCredits(selectedUser.id, (selectedUser.credits ?? 0) + 10)}
                      >
                        <Plus className="w-4 h-4 mr-2" /> +10
                      </Button>
                    </div>
                    
                    <div className="relative mt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ustaw ręcznie wartość:</p>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          className="flex-1 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl font-black text-brand-dark text-lg focus:border-primary outline-none transition-all"
                          value={editCredits}
                          onChange={(e) => setEditCredits(e.target.value)}
                        />
                        <Button 
                          className="px-6"
                          onClick={() => handleUpdateCredits(selectedUser.id, parseInt(editCredits) || 0)}
                        >
                          <Save className="w-4 h-4 mr-2" /> ZAPISZ
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center leading-relaxed">
                    1 kredyt odpowiada jednej operacji generowania oferty przez merytoryczny silnik AI.
                  </p>
                </div>
              </section>

              <section className="pt-10 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <Users className="w-3 h-3 text-primary" /> Profil I Uprawnienia
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Systemowy</p>
                    <p className="text-sm font-black text-brand-dark uppercase tracking-tight">{selectedUser.approved ? 'AUTORYZOWANY' : 'ZABLOKOWANY'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Poziom Dostępu</p>
                    <p className="text-sm font-black text-brand-dark uppercase tracking-tight">{selectedUser.role}</p>
                  </div>
                </div>
              </section>

              <section className="pt-10 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                  <UserX className="w-3 h-3" /> Strefa Krytyczna
                </h3>
                <div className="p-6 border-2 border-dashed border-red-100 rounded-3xl space-y-4">
                  <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                    Całkowite usunięcie operatora spowoduje bezpowrotną utratę wszystkich powiązanych danych oraz historii.
                  </p>
                  <Button 
                    variant="ghost" 
                    fullWidth 
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 font-black text-[10px] uppercase tracking-widest"
                    onClick={() => handleFullDelete(selectedUser.id)}
                  >
                    <Trash className="w-4 h-4 mr-2" />USUŃ KONTO OPERATORA
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
