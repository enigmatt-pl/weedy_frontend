import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Custom Emerald Icon for the picker
const pickerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-white shadow-xl transform -translate-y-1/2 -translate-x-1/2">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface LocationPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CenterMap = ({ lat, lng }: { lat: number, lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

export const LocationPicker = ({ lat, lng, onChange }: LocationPickerProps) => {
  const [position, setPosition] = useState<[number, number] | null>(
    lat && lng ? [lat, lng] : null
  );

  const defaultCenter: [number, number] = [52.237, 21.017]; // Warsaw

  const handleMapClick = (newLat: number, newLng: number) => {
    setPosition([newLat, newLng]);
    onChange(newLat, newLng);
  };

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner relative z-10">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 6}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapEvents onClick={handleMapClick} />
          {position && <Marker position={position} icon={pickerIcon} />}
          {position && <CenterMap lat={position[0]} lng={position[1]} />}
        </MapContainer>
        
        {!position && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl mb-4 animate-bounce">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-white font-black uppercase tracking-widest text-sm drop-shadow-md">Kliknij na mapie, aby zaznaczyć lokalizację</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Latitude</span>
          <span className="text-sm font-bold text-brand-dark">{position ? position[0].toFixed(6) : '---'}</span>
        </div>
        <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Longitude</span>
          <span className="text-sm font-bold text-brand-dark">{position ? position[1].toFixed(6) : '---'}</span>
        </div>
      </div>
    </div>
  );
};
