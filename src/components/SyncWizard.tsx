import { useState } from 'react';
import { Dispensary, DispensariesApi } from '../lib/api';
import { ItemPicker } from './ItemPicker';
import { PlatformProduct } from '../types/platform';
import { useToastStore } from '../store/toastStore';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { ArrowRight, Globe, CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';

interface SyncWizardProps {
  dispensary: Dispensary;
  onComplete: () => void;
  onCancel: () => void;
}

export const SyncWizard = ({ dispensary, onComplete, onCancel }: SyncWizardProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProduct, setSelectedProduct] = useState<PlatformProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToastStore();

  const handleLinkProduct = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      await DispensariesApi.update(dispensary.id, { platform_product_id: selectedProduct.id });
      showToast('Punkt powiązany pomyślnie', 'success');
      setStep(2);
    } catch {
      showToast('Błąd powiązania punktu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPublish = async () => {
    setLoading(true);
    try {
      await DispensariesApi.publish(dispensary.id);
      showToast('Wizytówka została opublikowana!', 'success');
      onComplete();
    } catch {
      showToast('Błąd publikacji', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark tracking-tight">Kreator Publikacji</h2>
          <p className="text-[10px] font-bold text-slate-400 tracking-wider">Step {step} of 2: {step === 1 ? 'Powiązanie z katalogiem' : 'Finalna weryfikacja'}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>Anuluj</Button>
      </div>

      {step === 1 && (
        <div className="space-y-8">
          <Card className="bg-slate-50 border-none shadow-inner overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-4">Twój Wygenerowany Przedmiot</h3>
              <p className="text-xl font-bold text-brand-dark  tracking-tight">{dispensary.title}</p>
            </CardContent>
          </Card>

          <div className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-xl">
            <h3 className="text-xl font-bold text-brand-dark tracking-tight mb-8 flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              Znajdź pasujący produkt Platform
            </h3>
            <ItemPicker 
              initialQuery={dispensary.title || ''} 
              onSelect={setSelectedProduct} 
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              size="lg" 
              onClick={handleLinkProduct} 
              disabled={!selectedProduct || loading}
              className="px-10 py-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'POWIĄŻ I PRZEJDŹ DALEJ'}
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-2xl bg-slate-50">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Dane Lokalnego Systemu</h4>
                <p className="text-lg font-bold text-brand-dark tracking-tight">{dispensary.title}</p>
                <div className="h-40 bg-white rounded-lg border border-slate-100 p-4 overflow-y-auto text-xs text-slate-500 leading-relaxed font-medium">
                  {dispensary.description}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-2xl bg-primary/5 border-2 border-primary/20">
              <CardContent className="p-8 space-y-4">
                <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest">Powiązany Produkt Platform</h4>
                <p className="text-lg font-bold text-brand-dark tracking-tight">{selectedProduct?.name}</p>
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-primary/10">
                  <img src={selectedProduct?.image_url || selectedProduct?.images?.[0]?.url} className="w-16 h-16 object-contain" alt="" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 tracking-wide">{selectedProduct?.category?.name || 'Inne'}</p>
                    <p className="text-xs font-bold text-slate-700">ID: {selectedProduct?.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between pt-10">
            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-slate-400 hover:text-brand-dark transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Zmień produkt
            </button>
            <Button 
              size="lg" 
              onClick={handleFinalPublish} 
              disabled={loading}
              className="px-12 py-8 bg-brand-dark hover:bg-black shadow-2xl shadow-black/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <CheckCircle2 className="mr-3 w-6 h-6" />
                  PUBLIKUJ WIZYTÓWKĘ W SIECI
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
