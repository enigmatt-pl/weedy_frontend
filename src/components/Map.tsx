import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Dispensary } from '../lib/api';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';

// Fix for Leaflet marker icons in build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Emerald Icon
const emeraldIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-xl transform -translate-y-1/2 -translate-x-1/2">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface MapProps {
  dispensaries: Dispensary[];
  onSelect?: (id: number) => void;
  selectedId?: number | null;
}

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const FitBounds = ({ dispensaries }: { dispensaries: Dispensary[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (dispensaries.length === 0) return;
    
    const bounds = L.latLngBounds(
      dispensaries.map(d => [d.latitude as number, d.longitude as number])
    );
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [dispensaries, map]);
  
  return null;
};

export const Map = ({ dispensaries, onSelect, selectedId }: MapProps) => {
  // Mock coordinates for demo if not provided
  const processedDispensaries = useMemo(() => {
    return dispensaries
      .map(d => {
        const id = Number(d.id) || 0;
        const rawLat = parseFloat(String(d.latitude));
        const rawLng = parseFloat(String(d.longitude));
        const lat = !isNaN(rawLat) ? rawLat : (52.237 + (Math.sin(id) * 2));
        const lng = !isNaN(rawLng) ? rawLng : (21.017 + (Math.cos(id) * 4));
        return { ...d, latitude: lat, longitude: lng };
      })
      .filter(d => !isNaN(d.latitude) && !isNaN(d.longitude));
  }, [dispensaries]);

  const center: [number, number] = [52.237, 21.017]; // Warsaw default

  return (
    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {processedDispensaries.map((dispensary) => (
          <Marker 
            key={dispensary.id} 
            position={[dispensary.latitude!, dispensary.longitude!]}
            icon={emeraldIcon}
            eventHandlers={{
              click: () => onSelect?.(dispensary.id),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 space-y-3 min-w-[200px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-dark leading-tight">{dispensary.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispensary</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {dispensary.description?.replace(/#{1,6}\s+/g, '').substring(0, 80)}...
                </p>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Navigation className="w-3 h-3" />
                    <span>{dispensary.query_data ? 'Lokalizacja zweryfikowana' : 'Brak dokładnego adresu'}</span>
                  </div>
                  {dispensary.phone && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Phone className="w-3 h-3" />
                      <span>{dispensary.phone}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => onSelect?.(dispensary.id)}
                  className="w-full mt-2 bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  Zobacz profil <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds dispensaries={processedDispensaries} />
      </MapContainer>

      {/* Map Overlay Stats */}
      <div className="absolute bottom-6 left-6 z-20 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-xl flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aktywne punkty</span>
          <span className="text-lg font-black text-brand-dark">{dispensaries.length}</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Region</span>
          <span className="text-lg font-black text-brand-dark">Polska</span>
        </div>
      </div>
    </div>
  );
};
