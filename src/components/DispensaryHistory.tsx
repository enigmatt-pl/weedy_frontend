import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DispensariesApi, Dispensary } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { 
  Save, Send, Package, Calendar, Loader2, Trash2, X, Search, 
  User, Scissors, Upload, Move, MapPin, Info, Store, FileText, Navigation
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from './ui/Textarea';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { ImageCropper } from './ImageCropper';

type HistoryFormData = z.infer<typeof historySchema>;

const historySchema = z.object({
  title: z.string().min(1, 'Nazwa jest wymagana'),
  description: z.string().min(1, 'Opis jest wymagany'),
  query_data: z.string().min(1, 'Lokalizacja jest wymagana'),
  city: z.string().optional(),
  categories: z.array(z.string()).optional(),
  latitude: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  longitude: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
});

const MAX_IMAGES = 16;

const SortableHistoryImage = ({ 
  img, 
  idx, 
  onPreview, 
  onCrop, 
  onRemove 
}: { 
  img: File | string; 
  idx: number; 
  onPreview: (url: string) => void;
  onCrop: (i: number, f: File | string) => void;
  onRemove: (i: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: img instanceof File 
      ? `file-${idx}-${img.lastModified}` 
      : `url-${idx}-${img}` 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const url = img instanceof File ? URL.createObjectURL(img) : img;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden group bg-slate-50 relative cursor-default"
    >
      <img
        src={url}
        alt={`Dokumentacja ${idx + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1.5 bg-brand-dark/50 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Move className="w-3 h-3" />
      </div>

      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(url); }}
          className="p-2 bg-white text-brand-dark rounded-xl hover:bg-primary hover:text-white transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCrop(idx, img); }}
          className="p-2 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          className="p-2 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const DispensaryHistory = () => {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const [meta, setMeta] = useState<{ total_pages: number; current_page: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { showToast } = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const [saving, setSaving] = useState(false);
  const [localImages, setLocalImages] = useState<(File | string)[]>([]);
  const [croppingImage, setCroppingImage] = useState<{ index: number; url: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<HistoryFormData>({
    resolver: zodResolver(historySchema),
  });

  useEffect(() => {
    if (selectedDispensary) {
      reset({
        title: selectedDispensary.title || '',
        description: selectedDispensary.description || '',
        query_data: selectedDispensary.location || selectedDispensary.query_data || '',
        city: selectedDispensary.city || '',
        categories: selectedDispensary.categories || [],
        latitude: selectedDispensary.latitude?.toString() || '',
        longitude: selectedDispensary.longitude?.toString() || '',
        phone: selectedDispensary.phone || '',
        email: selectedDispensary.email || '',
        website: selectedDispensary.website || '',
      });
      setLocalImages(selectedDispensary.image_urls || selectedDispensary.images || []);
    }
  }, [selectedDispensary, reset]);

  const fetchDispensaries = async () => {
    setLoading(true);
    try {
      const data = await DispensariesApi.getAll(currentPage, 10, userId);
      setDispensaries(data.dispensaries);
      setMeta(data.meta);
    } catch {
      showToast('Błąd pobierania historii', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispensaries();
  }, [currentPage, userId]);

  const handlePublish = async (id: number) => {
    setSaving(true);
    try {
      await DispensariesApi.publish(id);
      showToast('Punkt został opublikowany!', 'success');
      fetchDispensaries();
      setSelectedDispensary(null);
    } catch {
      showToast('Błąd publikacji', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number, payloadData: HistoryFormData) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('dispensary[title]', payloadData.title);
      formData.append('dispensary[description]', payloadData.description);
      formData.append('dispensary[query_data]', payloadData.query_data);
      if (payloadData.city) formData.append('dispensary[city]', payloadData.city);
      if (payloadData.categories) {
        payloadData.categories.forEach(cat => {
          formData.append('dispensary[categories][]', cat);
        });
      }
      if (payloadData.phone) formData.append('dispensary[phone]', payloadData.phone);
      if (payloadData.email) formData.append('dispensary[email]', payloadData.email);
      if (payloadData.website) formData.append('dispensary[website]', payloadData.website);
      if (payloadData.latitude !== undefined) {
        formData.append('dispensary[latitude]', payloadData.latitude.toString());
      }
      if (payloadData.longitude !== undefined) {
        formData.append('dispensary[longitude]', payloadData.longitude.toString());
      }

      await Promise.all(
        localImages.map(async (img, i) => {
          if (img instanceof File) {
            formData.append('dispensary[images][]', img, img.name);
          } else {
            const response = await fetch(img);
            const blob = await response.blob();
            const ext = img.split('.').pop()?.split('?')[0] || 'jpg';
            formData.append('dispensary[images][]', blob, `image-${i}.${ext}`);
          }
        })
      );

      await DispensariesApi.update(id, formData);
      showToast('Zmiany zostały zapisane', 'success');
      fetchDispensaries();
      setSelectedDispensary(null);
    } catch {
      showToast('Błąd aktualizacji', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await DispensariesApi.destroy(id);
      showToast('Punkt został usunięty', 'success');
      setDispensaries((prev) => prev.filter((l) => l.id !== id));
    } catch {
      showToast('Nie udało się usunąć punktu', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
        <p className="text-sm font-bold tracking-widest uppercase">Pobieranie punktów...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {selectedDispensary ? (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <button
            onClick={() => setSelectedDispensary(null)}
            className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
          >
            ← Wróć do listy
          </button>

          <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    selectedDispensary.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                  }`}>
                    {selectedDispensary.status === 'published' ? 'Opublikowany' : 'Szkic'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {selectedDispensary.id}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedDispensary.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                      <Info className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Podstawowe Dane</span>
                    </div>
                    <div className="space-y-6">
                      <Textarea
                        label="Nazwa Punktu"
                        {...register('title')}
                        error={errors.title?.message}
                        className="bg-white font-bold"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Miasto</label>
                          <input
                            {...register('city')}
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Kategorie (wybierz wiele)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['cbd', 'hemp', 'medical', 'accessories'].map((cat) => (
                              <label
                                key={cat}
                                className={`flex items-center justify-center px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all ${
                                  (watch('categories') || []).includes(cat)
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  value={cat}
                                  {...register('categories')}
                                />
                                <span className="text-xs font-black uppercase tracking-widest">
                                  {cat === 'cbd' ? 'CBD' : cat === 'hemp' ? 'Konopie' : cat === 'medical' ? 'Medyczna' : 'Akcesoria'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kontakt</label>
                        <div className="grid grid-cols-2 gap-4">
                           <input
                            {...register('phone')}
                            placeholder="Telefon"
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                           <input
                            {...register('email')}
                            placeholder="Email"
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                        <input
                          {...register('website')}
                          placeholder="Strona WWW"
                          className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>

                      <Textarea
                        label="Lokalizacja (Adres)"
                        {...register('query_data')}
                        error={errors.query_data?.message}
                        className="bg-white text-sm"
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Szerokość (Lat)</label>
                          <input
                            {...register('latitude')}
                            type="text"
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="np. 52.237"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Długość (Lng)</label>
                          <input
                            {...register('longitude')}
                            type="text"
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="np. 21.017"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                      <Package className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Galeria Zdjęć</span>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                      const { active, over } = e;
                      if (over && active.id !== over.id) {
                        const oldIdx = localImages.findIndex((img, i) => (img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`) === active.id);
                        const newIdx = localImages.findIndex((img, i) => (img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`) === over.id);
                        if (oldIdx !== -1 && newIdx !== -1) {
                          setLocalImages(prev => arrayMove(prev, oldIdx, newIdx));
                        }
                      }
                    }}>
                      <SortableContext 
                        items={localImages.map((img, i) => (img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`))} 
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {localImages.map((img, idx) => (
                            <SortableHistoryImage
                              key={img instanceof File ? `file-${idx}` : `url-${idx}`}
                              img={img}
                              idx={idx}
                              onPreview={setSelectedImage}
                              onCrop={(i, f) => setCroppingImage({ index: i, url: typeof f === 'string' ? f : URL.createObjectURL(f) })}
                              onRemove={(i) => setLocalImages(prev => prev.filter((_, idx) => idx !== i))}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>

                <div className="space-y-8 flex flex-col">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                      <FileText className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Pełny Opis</span>
                    </div>
                    <Textarea
                      {...register('description')}
                      error={errors.description?.message}
                      className="bg-white flex-1 min-h-[300px]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      fullWidth
                      variant="secondary"
                      size="lg"
                      className="rounded-2xl py-8"
                      onClick={handleSubmit((data) => handleUpdate(selectedDispensary.id, data))}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Zapisz zmiany</>}
                    </Button>
                    {selectedDispensary.status !== 'published' && (
                      <Button
                        fullWidth
                        size="lg"
                        className="rounded-2xl py-8 shadow-2xl shadow-emerald-500/20"
                        onClick={() => handlePublish(selectedDispensary.id)}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-3" /> Publikuj</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex items-center justify-between">
            <div className="border-l-4 border-primary pl-6">
              <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight mb-2">Twoje Punkty</h1>
              <p className="text-slate-400 font-medium tracking-wide">Zarządzaj swoją siecią placówek Weedy</p>
            </div>
            {userId && (
              <Button variant="ghost" size="sm" onClick={() => setSearchParams({})}>
                Wyczyść filtry
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {dispensaries.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Brak zapisanych punktów</p>
              </div>
            ) : (
              dispensaries.map((dispensary) => (
                <Card
                  key={dispensary.id}
                  className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white cursor-pointer"
                  onClick={() => setSelectedDispensary(dispensary)}
                >
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    {(dispensary.image_urls?.[0] || dispensary.images?.[0]) ? (
                      <img
                        src={dispensary.image_urls?.[0] || dispensary.images?.[0]}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Store className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                       <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg ${
                         dispensary.status === 'published' ? 'bg-green-500 text-white' : 'bg-primary text-white'
                       }`}>
                         {dispensary.status === 'published' ? 'Live' : 'Draft'}
                       </div>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <MapPin className="w-3 h-3 text-primary" />
                       <span className="truncate">{dispensary.query_data || 'Brak lokalizacji'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark group-hover:text-primary transition-colors line-clamp-1">{dispensary.title}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {dispensary.id.toString().slice(0, 8)}</span>
                       <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => setConfirmDeleteId(dispensary.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>

                  {confirmDeleteId === dispensary.id && (
                    <div className="absolute inset-0 bg-red-600/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 z-20">
                      <p className="text-white font-bold uppercase tracking-widest mb-6">Usunąć ten punkt permanentnie?</p>
                      <div className="flex gap-4">
                        <Button variant="secondary" size="sm" onClick={() => setConfirmDeleteId(null)}>Anuluj</Button>
                        <Button 
                          className="bg-white text-red-600 hover:bg-slate-100" 
                          size="sm" 
                          onClick={() => handleDelete(dispensary.id)}
                          disabled={deletingId === dispensary.id}
                        >
                          {deletingId === dispensary.id ? 'Usuwanie...' : 'Tak, usuń'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-brand-dark/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img src={selectedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" alt="Powiększenie" />
        </div>
      )}

      {croppingImage && (
        <ImageCropper
          image={croppingImage.url}
          onCropComplete={(blob) => {
            const fileName = `cropped-${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            setLocalImages(prev => {
              const next = [...prev];
              next[croppingImage.index] = file;
              return next;
            });
            setCroppingImage(null);
          }}
          onCancel={() => setCroppingImage(null)}
        />
      )}
    </div>
  );
};
