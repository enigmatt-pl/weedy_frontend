import { useState, useEffect } from 'react';
import { PlatformApi } from '../lib/api';
import { PlatformProduct } from '../types/platform';
import { Search, Loader2, CheckCircle2, Package } from 'lucide-react';
import { Input } from './ui/Input';

interface ItemPickerProps {
  onSelect: (product: PlatformProduct) => void;
  initialQuery?: string;
}

export const ItemPicker = ({ onSelect, initialQuery = '' }: ItemPickerProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<PlatformProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const { products } = await PlatformApi.searchProducts(query);
        setProducts(products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          placeholder="Szukaj punktu w sieci (np. Green Therapy Katowice)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />}
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => {
              setSelectedId(product.id);
              onSelect(product);
            }}
            className={`
              flex items-start gap-6 p-4 rounded-xl border-2 transition-all cursor-pointer group
              ${selectedId === product.id 
                ? 'border-primary bg-primary/5 shadow-lg' 
                : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}
            `}
          >
            <div className="w-24 h-24 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100 p-2">
              {(product.image_url || product.images?.[0]) ? (
                <img src={product.image_url || product.images?.[0]?.url} alt="" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm font-bold text-brand-dark tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                {selectedId === product.id && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </div>
              
              <p className="text-[10px] font-bold text-slate-400 tracking-wide bg-slate-100 px-2 py-1 rounded inline-block">
                {product.category?.name || 'Inne'}
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {product.parameters.slice(0, 4).map((param) => (
                  <span key={param.id} className="text-[9px] font-bold tracking-tight text-slate-500 border border-slate-200 px-2 py-0.5 rounded ">
                    {param.name}: {param.values?.join(', ') || 'N/A'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {!loading && query && products.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold tracking-wide text-[11px]">Brak produktów w katalogu dla frazy "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
