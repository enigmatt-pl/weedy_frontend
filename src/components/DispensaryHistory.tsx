import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DispensariesApi, Dispensary } from '../lib/api';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { 
  Save, Send, Package, Calendar, Loader2, Trash2, X, Search, 
  BrainCircuit, ChevronDown, ChevronUp, User, Scissors, Upload, Move 
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SyncWizard } from './SyncWizard';
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

type HistoryFormData = z.infer<typeof historySchema>;

const historySchema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  description: z.string().min(1, 'Opis jest wymagany'),
  estimated_price: z.number().min(0.01, 'Cena musi być większa niż 0'),
});

import { ImageCropper } from './ImageCropper';

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
      className="aspect-square rounded border-2 border-slate-100 overflow-hidden group bg-slate-50 relative cursor-default"
    >
      <img
        src={url}
        alt={`Dokumentacja wizualna ${idx + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1.5 bg-brand-dark/50 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Przeciągnij, aby zmienić kolejność"
      >
        <Move className="w-3 h-3" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-brand-dark/80 backdrop-blur-sm p-2 flex items-center justify-around opacity-0 group-hover:opacity-100 transition-all transform translate-y-full group-hover:translate-y-0">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(url); }}
          className="p-1.5 bg-white text-brand-dark rounded hover:bg-primary hover:text-white transition-colors"
          title="Powiększ"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCrop(idx, img); }}
          className="p-1.5 bg-white text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
          title="Kadruj / Obróć"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
          className="p-1.5 bg-white text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
          title="Usuń"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
// Strip markdown syntax for clean plain-text preview
const stripMarkdown = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s+/g, '')         // headings
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
    .replace(/\*(.*?)\*/g, '$1')       // italic
    .replace(/`(.*?)`/g, '$1')         // inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/^\s*[-*+]\s+/gm, '')     // list bullets
    .replace(/\n{2,}/g, ' ')           // collapse blank lines
    .trim();
};

export const DispensaryHistory = () => {
  const getImages = (dispensary: Dispensary): string[] => {
    return dispensary.image_urls || dispensary.images || [];
  };

  const [dispensaries, setDispensaries] = useState<Dispensary[]>([]);
  const [selectedDispensary, setSelectedDispensary] = useState<Dispensary | null>(null);
  const [meta, setMeta] = useState<{ total_pages: number; current_page: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPublishWizard, setShowPublishWizard] = useState(false);
  const [activeDispensary, setActiveDispensary] = useState<Dispensary | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const { showToast } = useToastStore();
  const { role } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get('userId') || undefined;
  const [saving, setSaving] = useState(false);
  const [localImages, setLocalImages] = useState<(File | string)[]>([]);
  const [croppingImage, setCroppingImage] = useState<{ index: number; url: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localImages.findIndex((img, i) => {
        const id = img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`;
        return id === active.id;
      });
      const newIndex = localImages.findIndex((img, i) => {
        const id = img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`;
        return id === over.id;
      });

      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalImages((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<HistoryFormData>({
    resolver: zodResolver(historySchema),
  });

  useEffect(() => {
    if (selectedDispensary) {
      reset({
        title: selectedDispensary.title || '',
        description: selectedDispensary.description || '',
        estimated_price: Number(selectedDispensary.estimated_price) || 0,
      });
      setLocalImages(getImages(selectedDispensary));
    }
  }, [selectedDispensary, reset]);

  useEffect(() => {
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

    fetchDispensaries();
  }, [showToast, currentPage, showPublishWizard, userId]);

  const handlePublish = async (dispensary: Dispensary, payloadData?: HistoryFormData) => {
    if (payloadData) {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('dispensary[title]', payloadData.title);
        formData.append('dispensary[description]', payloadData.description);
        formData.append('dispensary[estimated_price]', payloadData.estimated_price.toString());
        formData.append('dispensary[status]', 'draft');

        // Convert all images to Blobs with filenames to ensure Rails sees them as Files
        const imageFiles = await Promise.all(
          localImages.map(async (img, i) => {
            if (img instanceof File) return img;
            const response = await fetch(img);
            const blob = await response.blob();
            const ext = img.split('.').pop()?.split('?')[0] || 'jpg';
            return { blob, name: `image-${i}.${ext}` };
          })
        );

        imageFiles.forEach((img) => {
          if (img instanceof File) {
            formData.append('dispensary[images][]', img, img.name);
          } else {
            formData.append('dispensary[images][]', img.blob, img.name);
          }
        });

        const { data: response } = await DispensariesApi.update(dispensary.id, formData);
        const updatedDispensary = response.dispensary || response;
        setDispensaries(prev => prev.map(l => l.id === dispensary.id ? updatedDispensary : l));
        setSelectedDispensary(updatedDispensary);
        setActiveDispensary(updatedDispensary);
        setShowPublishWizard(true);
      } catch (error) {
        showToast('Wystąpił błąd podczas przygotowania oferty', 'error');
      } finally {
        setSaving(false);
      }
    } else {
      setActiveDispensary(dispensary);
      setShowPublishWizard(true);
    }
  };

  const handleUpdate = async (id: number, payloadData: HistoryFormData) => {
    setSaving(true);
    try {
      const dispensary = dispensaries.find(l => l.id === id);
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('dispensary[title]', payloadData.title);
      formData.append('dispensary[description]', payloadData.description);
      formData.append('dispensary[estimated_price]', payloadData.estimated_price.toString());
      formData.append('dispensary[status]', dispensary?.status || 'draft');

      // Convert all images to Blobs with filenames to ensure Rails sees them as Files
      const imageFiles = await Promise.all(
        localImages.map(async (img, i) => {
          if (img instanceof File) return img;
          const response = await fetch(img);
          const blob = await response.blob();
          const ext = img.split('.').pop()?.split('?')[0] || 'jpg';
          return { blob, name: `image-${i}.${ext}` };
        })
      );

      imageFiles.forEach((img) => {
        if (img instanceof File) {
          formData.append('dispensary[images][]', img, img.name);
        } else {
          formData.append('dispensary[images][]', img.blob, img.name);
        }
      });

      const { data } = await DispensariesApi.update(id, formData);
      const updatedDispensary = data.dispensary || data;

      showToast('Zmiany zostały zapisane', 'success');

      // Update global list and selection
      setDispensaries(prev => prev.map(l => l.id === id ? updatedDispensary : l));
      setSelectedDispensary(updatedDispensary);
    } catch {
      showToast('Błąd aktualizacji oferty', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setLocalImages(prev => prev.filter((_, i) => i !== index));
  };

  const openCropper = async (index: number, img: File | string) => {
    if (img instanceof File) {
      setCroppingImage({ index, url: URL.createObjectURL(img) });
    } else {
      // Fetch the external image as a blob to avoid Canvas CORS tainting
      try {
        const response = await fetch(img);
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob);
        setCroppingImage({ index, url: localUrl });
      } catch {
        // Fallback: use the URL directly (may fail on canvas if CORS blocked)
        setCroppingImage({ index, url: img });
      }
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (!croppingImage) return;
    const originalImg = localImages[croppingImage.index];
    const fileName = originalImg instanceof File ? originalImg.name : `img-${croppingImage.index}.jpg`;

    // Create new file with NEW timestamp to bust cache/force re-render
    const newFile = new File([croppedBlob], fileName, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    setLocalImages(prev => {
      const newImgs = [...prev];
      newImgs[croppingImage.index] = newFile;
      return newImgs;
    });
    setCroppingImage(null);
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remaining = MAX_IMAGES - localImages.length;
      if (remaining <= 0) return;
      setLocalImages(prev => [...prev, ...files.slice(0, remaining)]);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await DispensariesApi.destroy(id);
      showToast('Oferta została usunięta', 'success');
      setDispensaries((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Nie udało się usunąć oferty',
        'error'
      );
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
        <p className="text-lg font-bold uppercase tracking-widest text-xs">Pobieranie historii ofert...</p>
      </div>
    );
  }

  if (showPublishWizard && activeDispensary) {
    return (
      <SyncWizard
        dispensary={activeDispensary}
        onComplete={() => {
          setShowPublishWizard(false);
          setActiveDispensary(null);
          setSelectedDispensary(null);
        }}
        onCancel={() => {
          setShowPublishWizard(false);
          setActiveDispensary(null);
        }}
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500 relative">
      {selectedDispensary ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="mb-6">
            <button
              id="history-back-to-list-btn"
              onClick={() => setSelectedDispensary(null)}
              className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
            >
              ← Wróć do listy wizytówek
            </button>
          </div>

          <Card className="overflow-hidden border-none shadow-2xl">
            <div className="p-10">
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${selectedDispensary.status === 'published' ? 'bg-green-600 text-white' : 'bg-primary text-white'
                      }`}>
                      {selectedDispensary.status === 'published' ? 'Opublikowane' : 'Szkic'}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-black rounded tracking-widest">
                      ID #{selectedDispensary.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Utworzono: {new Date(selectedDispensary.created_at).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-900 overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Opis Punktu / Lokalizacja</p>
                  <p className="text-[11px] font-medium text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {selectedDispensary.query_data || 'Brak danych lokalizacji'}
                  </p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <Textarea
                  id="history-edit-title"
                  label="Tytuł rynkowy"
                  placeholder="Wprowadź tytuł oferty"
                  rows={2}
                  error={errors.title?.message}
                  disabled={saving}
                  {...register('title')}
                  className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 md:gap-12">
                <div className="xl:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4 border-b border-slate-100 pb-2">Opis techniczny</h3>
                    <Textarea
                      id="history-edit-description"
                      placeholder="Wprowadź opis punktu"
                      rows={12}
                      error={errors.description?.message}
                      disabled={saving}
                      {...register('description')}
                      className="text-slate-600 leading-relaxed font-medium text-sm md:text-base h-auto"
                    />
                  </div>

                  {(selectedDispensary.reasoning?.trim()) && role === 'super_admin' && (
                    <div className="bg-slate-50 border-l-4 border-primary/30 p-2 md:p-4 rounded-r-xl shadow-inner mb-6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowReasoning(!showReasoning);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2 hover:bg-slate-100/50 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BrainCircuit className={`w-5 h-5 transition-colors ${showReasoning ? 'text-primary' : 'text-slate-400'}`} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Analiza Techniczna AI (Reasoning)</p>
                        </div>
                        {showReasoning ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {showReasoning && (
                        <div className="px-4 py-6 animate-in slide-in-from-top-2 duration-300 border-t border-slate-200/60 mt-2">
                          <p className="text-xs font-medium text-slate-600 leading-relaxed italic whitespace-pre-wrap font-mono">
                            "{selectedDispensary.reasoning}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="xl:col-span-2 space-y-10">
                  <div className="bg-brand-dark p-6 md:p-8 rounded shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 text-right">Cena docelowa (PLN)</p>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <input
                          id="history-edit-price"
                          type="number"
                          step="0.01"
                          disabled={saving}
                          {...register('estimated_price', { valueAsNumber: true })}
                          className="bg-brand-dark border-b-2 border-primary text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter italic w-32 text-center outline-none focus:border-white transition-colors"
                        />
                        <span className="text-sm md:text-base text-white opacity-50 font-black italic">PLN</span>
                      </div>
                      {errors.estimated_price && (
                        <p className="text-[9px] font-bold text-red-500 uppercase mt-2">{errors.estimated_price.message}</p>
                      )}
                    </div>
                  </div>

                  {localImages.length > 0 && (
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-4 flex items-center justify-between">
                        <span>Dokumentacja wizualna <span className="text-primary">[{localImages.length} / {MAX_IMAGES}]</span></span>
                        {localImages.length < MAX_IMAGES && (
                          <label className="cursor-pointer text-primary hover:text-emerald-700 transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Dodaj</span>
                            <input id="history-add-image-input" type="file" multiple accept="image/*" className="hidden" onChange={handleFileAdd} />
                          </label>
                        )}
                      </h3>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToParentElement]}
                      >
                        <SortableContext
                          items={localImages.map((img, i) => img instanceof File ? `file-${i}-${img.lastModified}` : `url-${i}-${img}`)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            {localImages.map((img, idx) => (
                              <SortableHistoryImage
                                key={img instanceof File ? `file-${idx}-${img.lastModified}` : `url-${idx}-${img}`}
                                img={img}
                                idx={idx}
                                onPreview={setSelectedImage}
                                onCrop={openCropper}
                                onRemove={removeImage}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  {croppingImage && (
                    <ImageCropper
                      image={croppingImage.url}
                      onCropComplete={handleCropComplete}
                      onCancel={() => setCroppingImage(null)}
                    />
                  )}

                  <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                    <Button
                      id="history-save-changes-btn"
                      fullWidth
                      variant="secondary"
                      size="lg"
                      onClick={handleSubmit((data) => handleUpdate(selectedDispensary.id, data))}
                      disabled={saving}
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" />Zapisz zmiany</>
                      )}
                    </Button>

                    {selectedDispensary.status === 'draft' && (
                      <Button
                        id="history-publish-platform-btn"
                        fullWidth
                        size="lg"
                        onClick={handleSubmit((data) => handlePublish(selectedDispensary, data))}
                        disabled={saving}
                        className="shadow-xl shadow-emerald-500/10"
                      >
                        {saving ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" />Publikuj w Sieci</>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-8 md:mb-12 border-l-4 border-primary pl-4 md:pl-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-brand-dark mb-1 uppercase tracking-tight">
                {userId ? 'Zasoby operatora' : 'Twoje zasoby'}
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-[11px] flex items-center gap-2">
                {userId && <User className="w-3 h-3 text-primary" />}
                {userId ? `Terminal: Przegląd historyczny dla ID: ${userId}` : 'Repozytorium wizytówek wygenerowanych przez system'}
              </p>
            </div>
            {userId && (
              <Button
                id="history-my-assets-btn"
                variant="secondary"
                size="sm"
                onClick={() => setSearchParams({})}
                className="text-[10px] font-black uppercase tracking-widest h-8"
              >
                ← MOJA HISTORIA
              </Button>
            )}
          </div>

          <div className="grid gap-6">
            {dispensaries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                  Historia ofert
                </h2>
                <p className="text-slate-500 text-sm md:text-lg max-w-md mx-auto">
                  Tutaj pojawią się Twoje poprzednie wizytówki. Zacznij od dodania nowej!
                </p>
              </div>
            ) : (
              dispensaries.map((dispensary) => (
                <Card
                  id={`dispensary-card-${dispensary.id}`}
                  key={dispensary.id}
                  className="overflow-hidden border-slate-200 hover:border-primary cursor-pointer group flex flex-col md:flex-row transition-all duration-300"
                  onClick={() => setSelectedDispensary(dispensary)}
                >
                  <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden bg-slate-100 flex-shrink-0 relative">
                    {getImages(dispensary).length > 0 ? (
                      <img
                        src={getImages(dispensary)[0]}
                        alt={`Miniatura: ${dispensary.title}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    {dispensary.status === 'published' && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                        LIVE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[250px]" title={dispensary.query_data || ''}>
                          <Package className="w-3 h-3 mr-1" /> {(dispensary.query_data || '').replace(/\n/g, ' ')}
                        </span>
                        <span className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Calendar className="w-3 h-3 mr-1" /> 
                          {new Date(dispensary.created_at).toLocaleDateString()} {new Date(dispensary.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center text-[10px] font-black tracking-widest text-slate-300 border-l border-slate-200 pl-3">
                          ID #{dispensary.id}
                        </span>
                        {dispensary.reasoning && role === 'super_admin' && (
                          <span className="flex items-center text-[8px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-100">
                            <BrainCircuit className="w-2.5 h-2.5 mr-1" /> AI Reasoning
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-brand-dark mb-2 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                        {dispensary.title}
                      </h3>

                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium mb-4 italic">
                        {stripMarkdown(dispensary.description)}
                      </p>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Wartość orientacyjna</span>
                        <p className="text-xl font-black text-brand-dark tracking-tighter">
                          {Number(dispensary.estimated_price).toFixed(2)} <span className="text-xs">PLN</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        {dispensary.status === 'draft' && (
                          <Button
                            id={`dispensary-publish-btn-${dispensary.id}`}
                            size="sm"
                            onClick={() => handlePublish(dispensary)}
                            className="shadow-lg shadow-emerald-500/20"
                          >
                            <span className="flex items-center gap-2">Opublikuj</span>
                          </Button>
                        )}

                        {confirmDeleteId === dispensary.id ? (
                          <div className="flex items-center gap-3 bg-red-600 px-3 py-1.5 rounded animate-in fade-in zoom-in-95 duration-200">
                            <span className="text-[9px] text-white font-black uppercase tracking-widest">Usunąć?</span>
                            <button
                              id={`dispensary-delete-confirm-${dispensary.id}`}
                              onClick={() => handleDelete(dispensary.id)}
                              disabled={deletingId === dispensary.id}
                              className="text-[10px] font-black text-white hover:underline uppercase"
                            >
                              Tak
                            </button>
                            <button
                              id={`dispensary-delete-cancel-${dispensary.id}`}
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-black text-white/70 hover:text-white uppercase"
                            >
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`dispensary-delete-init-${dispensary.id}`}
                            onClick={() => setConfirmDeleteId(dispensary.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Usuń wizytówkę"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 bg-white p-4 rounded-lg border border-slate-200">
              <Button
                id="history-pagination-prev"
                variant="secondary"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Poprzednia
              </Button>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strona</span>
                <input
                  id="history-pagination-input"
                  type="number"
                  min={1}
                  max={meta.total_pages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= meta.total_pages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-12 h-8 text-center bg-slate-50 border-2 border-slate-100 rounded-lg text-xs font-black text-brand-dark focus:border-primary outline-none transition-all"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">z {meta.total_pages}</span>
              </div>
              <Button
                id="history-pagination-next"
                variant="secondary"
                size="sm"
                disabled={currentPage === meta.total_pages || loading}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Następna
              </Button>
            </div>
          )}
        </>
      )}

      {/* Image Preview Modal - Outside of dispensary condition so it's always accessible */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-brand-dark/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 p-3 text-white hover:bg-white/10 rounded-full transition-colors border border-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-6xl max-h-full relative animate-in zoom-in-95 duration-500 border-4 border-white/10 shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Pełny podgląd dokumentacji"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
