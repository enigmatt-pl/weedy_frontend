import React, { useEffect } from 'react';
import { MapPin, Clock, Star, Package, Leaf } from 'lucide-react';
import { Dispensary } from '../lib/api';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { AnalyticsService } from '../lib/analytics';

interface DispensaryListItemProps {
  dispensary: Dispensary;
  viewMode: 'grid' | 'map';
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  selectedId: string | null;
  setViewMode: (mode: 'grid' | 'map') => void;
}

const stripMarkdown = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
};

export const DispensaryListItem: React.FC<DispensaryListItemProps> = ({
  dispensary,
  viewMode,
  hoveredId,
  setHoveredId,
  focusedId,
  setFocusedId,
  selectedId,
  setViewMode,
}) => {
  const images = dispensary.image_urls || dispensary.images || [];
  const isHovered = hoveredId === dispensary.id;
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.5, freezeOnceVisible: true });

  useEffect(() => {
    if (isVisible) {
      AnalyticsService.trackEvent('Dispensary', 'Impression', dispensary.id);
    }
  }, [isVisible, dispensary.id]);

  const handleClick = () => {
    AnalyticsService.trackEvent('Dispensary', 'Click', dispensary.id);
    setFocusedId(dispensary.id);
    if (viewMode === 'map') {
      // Already showing map
    } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setViewMode('map');
    }
  };

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      id={`dispensary-${dispensary.id}`}
      onMouseEnter={() => setHoveredId(dispensary.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={handleClick}
      className={`bg-white rounded-3xl border shadow-lg shadow-slate-200/50 overflow-hidden group cursor-pointer transition-all duration-500
        ${(selectedId === dispensary.id || focusedId === dispensary.id) ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100'}
        ${viewMode === 'grid' ? 'hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1' : 'flex items-center p-4 gap-4 hover:bg-emerald-50/50'}
      `}
    >
      <div className={`bg-gradient-to-br from-emerald-50 to-slate-100 overflow-hidden relative shrink-0
        ${viewMode === 'grid' ? 'aspect-[4/3]' : 'w-24 h-24 rounded-2xl'}
      `}>
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={dispensary.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <Leaf className="w-8 h-8 text-emerald-200" />
          </div>
        )}
      </div>

      <div className={`flex-1 ${viewMode === 'grid' ? 'p-5' : 'py-1'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-bold text-brand-dark leading-tight group-hover:text-primary transition-colors line-clamp-1 ${viewMode === 'grid' ? 'text-base' : 'text-sm'}`}>
            {dispensary.title}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-slate-700">{dispensary.rating || 'N/A'}</span>
          </div>
        </div>

        {dispensary.query_data && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-[10px] font-medium text-slate-500 truncate">
              {dispensary.query_data.replace(/\n/g, ' ')}
            </p>
          </div>
        )}

        {viewMode === 'grid' && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {stripMarkdown(dispensary.description) || 'Profesjonalny punkt dystrybucji produktów konopnych.'}
          </p>
        )}

        <div className={`flex items-center justify-between pt-3 border-t border-slate-50 ${viewMode === 'grid' ? '' : 'hidden'}`}>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-medium">{dispensary.hours || 'Godziny niepodane'}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
            <Package className="w-3 h-3" />
            <span>CBD · Hemp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
