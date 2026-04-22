import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Loader2 } from 'lucide-react';

const queryDataSchema = z.object({
  queryData: z.string().min(3, 'Wprowadź co najmniej 3 znaki').max(1000, 'Maksymalnie 1000 znaków'),
});

type QueryDataFormData = z.infer<typeof queryDataSchema>;

interface ReferenceInputProps {
  value: string;
  onChange: (value: string) => void;
  onBack: () => void;
  onGenerate: (queryData: string) => void;
  loading: boolean;
}

export const ReferenceInput = ({
  value,
  onChange,
  onBack,
  onGenerate,
  loading,
}: ReferenceInputProps) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QueryDataFormData>({
    resolver: zodResolver(queryDataSchema),
    defaultValues: { queryData: value },
  });

  const onSubmit = (data: QueryDataFormData) => {
    onChange(data.queryData);
    onGenerate(data.queryData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full lg:max-w-xl bg-slate-50 p-4 md:p-8 rounded border border-slate-200 shadow-inner">
        <Textarea
          id="queryData"
          rows={4}
          label="Dane lokalizacyjne i opis punktu"
          placeholder={`Wprowadź dane o punkcie. Np.:\n\nGreen Therapy, ul. Mariacka 12, Katowice. Specjalizacja: Susz CBD, Akcesoria.\nWeedy Shop, Wrocław, Rynek 5.`}
          error={errors.queryData?.message}
          {...register('queryData')}
          className="bg-white text-sm"
        />
        <p className="mt-3 md:mt-4 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          Wklej adres lub opis punktu, który chcesz dodać. AI zidentyfikuje szczegóły na podstawie zdjęć i dostępnych danych.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 relative">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
        >
          [ ANULUJ ]
        </button>
        <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
          {loading && (
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded flex items-center gap-3 animate-pulse">
              <Loader2 className="w-3 h-3 text-primary animate-spin" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center sm:text-right leading-tight">
                Analizujemy dane... Może to potrwać od 15 do 60 sekund.<br/>Prosimy nie odświeżać strony.
              </p>
            </div>
          )}
          <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto shadow-xl shadow-emerald-500/20">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                PRZETWARZANIE...
              </>
            ) : (
              'INICJUJ GENEROWANIE'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
